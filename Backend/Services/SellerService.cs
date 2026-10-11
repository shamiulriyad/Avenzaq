using Backend.Data;
using Backend.DTOs.Sellers;
using Backend.Interfaces.Repositories;
using Backend.Interfaces.Services;
using Backend.Models.Entities;
using Backend.Models.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class SellerService : ISellerService
{
    private readonly MarketplaceDbContext _db;
    private readonly IUserRepository _userRepository;
    private readonly ISellerRepository _sellerRepository;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public SellerService(MarketplaceDbContext db, IUserRepository userRepository, ISellerRepository sellerRepository, IWebHostEnvironment webHostEnvironment)
    {
        _db = db;
        _userRepository = userRepository;
        _sellerRepository = sellerRepository;
        _webHostEnvironment = webHostEnvironment;
    }

    public async Task RegisterAsync(Guid userId, RegisterSellerDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        var existing = await _sellerRepository.GetByUserIdAsync(userId);
        if (existing != null)
        {
            throw new InvalidOperationException("Seller profile already exists.");
        }

        // Save uploaded documents
        var nidDocUrl = await SaveDocumentIfExists(dto.NidDocument, "nid");
        var tradeLicUrl = await SaveDocumentIfExists(dto.TradeLicenseFile, "tradelicense");
        var tinDocUrl = await SaveDocumentIfExists(dto.TinDocument, "tin");
        var bankStmtUrl = await SaveDocumentIfExists(dto.BankStatementFile, "bankstatement");

        var seller = new SellerProfile
        {
            UserId = userId,
            ShopName = dto.ShopName.Trim(),
            ShopSlug = Slugify(dto.ShopName),
            Description = dto.Description,
            Category = dto.Category,
            EstablishedYear = dto.EstablishedYear,
            Website = dto.Website,
            OwnerName = dto.OwnerName,
            OwnerEmail = dto.OwnerEmail,
            OwnerPhone = dto.OwnerPhone,
            OwnerAddress = dto.OwnerAddress,
            OwnerIdType = dto.OwnerIdType,
            OwnerIdNumber = dto.OwnerIdNumber,
            BusinessType = dto.BusinessType,
            TaxId = dto.TaxId,
            BusinessLicense = dto.BusinessLicense,
            NidDocumentUrl = nidDocUrl,
            TradeLicenseUrl = tradeLicUrl,
            TinDocumentUrl = tinDocUrl,
            BankStatementUrl = bankStmtUrl,
            BankAccountName = dto.BankAccountName,
            BankAccountNumber = dto.BankAccountNumber,
            BankName = dto.BankName,
            BankBranch = dto.BankBranch,
            ReturnPolicy = dto.ReturnPolicy,
            ShippingPolicy = dto.ShippingPolicy,
            ProcessingTime = dto.ProcessingTime,
            AcceptsCOD = dto.AcceptsCOD,
            IsApproved = false,
            CommissionRate = 0.10m
        };

        await _sellerRepository.AddAsync(seller);
        user.Role = UserRole.Seller;

        await _sellerRepository.SaveChangesAsync();
    }

    public async Task<SellerDashboardDto> GetDashboardAsync(Guid userId, string dateRange = "week")
    {
        var seller = await _sellerRepository.GetByUserIdAsync(userId)
            ?? throw new InvalidOperationException("Seller profile not found.");

        if (!seller.IsApproved)
        {
            throw new UnauthorizedAccessException("Seller profile is pending admin approval.");
        }

        // Calculate date range
        var startDate = dateRange switch
        {
            "month" => DateTime.UtcNow.AddMonths(-1),
            "year" => DateTime.UtcNow.AddYears(-1),
            _ => DateTime.UtcNow.AddDays(-7), // week (default)
        };

        // Basic counts
        var totalProducts = await _db.Products.CountAsync(p => p.SellerId == seller.Id);
        var pendingOrders = await _db.SellerOrders.CountAsync(so => so.SellerId == seller.Id && so.Status == OrderStatus.Pending);
        
        // Sales data (within date range)
        var totalSales = await _db.SellerOrders
            .Where(so => so.SellerId == seller.Id 
                && so.Status == OrderStatus.Delivered
                && so.CreatedAtUtc >= startDate)
            .SumAsync(so => (decimal?)so.NetAmount) ?? 0;

        // Average rating from reviews
        var avgRating = await _db.Reviews
            .Where(r => r.Product.SellerId == seller.Id)
            .AverageAsync(r => (double?)r.Rating) ?? 0;

        // Low stock count
        var lowStockCount = await _db.Products
            .CountAsync(p => p.SellerId == seller.Id && p.StockQty < 10);

        // Recent orders (last 5)
        var recentOrders = await _db.SellerOrders
            .Where(so => so.SellerId == seller.Id)
            .OrderByDescending(so => so.CreatedAtUtc)
            .Take(5)
            .Select(so => new SellerRecentOrderDto
            {
                Id = so.Id,
                CustomerName = so.Order.Customer.FullName ?? "Guest",
                Amount = so.NetAmount,
                Status = so.Status.ToString()
            })
            .ToListAsync();

        // Top selling products (last 5)
        // Load data into memory first, then group (EF Core can't translate complex GroupBy to SQL)
        var sellerOrdersForGrouping = await _db.SellerOrders
            .Where(so => so.SellerId == seller.Id 
                && so.Status == OrderStatus.Delivered
                && so.CreatedAtUtc >= startDate)
            .Include(so => so.Items)
            .ThenInclude(oi => oi.Product)
            .ThenInclude(p => p.Images)
            .ToListAsync();

        var topProducts = sellerOrdersForGrouping
            .GroupBy(so => so.Items.FirstOrDefault()?.Product)
            .Where(g => g.Key != null)
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => new TopProductDto
            {
                Id = g.Key!.Id,
                Name = g.Key!.Name,
                Image = g.Key!.Images.FirstOrDefault()?.ImageUrl ?? "",
                Sold = g.Count(),
                Revenue = g.Sum(so => so.NetAmount)
            })
            .ToList();

        // Recent reviews (last 5)
        var recentReviews = await _db.Reviews
            .Where(r => r.Product.SellerId == seller.Id)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(5)
            .Select(r => new SellerReviewDto
            {
                CustomerName = r.Customer.FullName ?? "Guest",
                Rating = r.Rating,
                Comment = r.Comment ?? "",
                ProductName = r.Product.Name
            })
            .ToListAsync();

        // Sales chart based on date range
        var salesChart = new List<int>();
        int days = dateRange switch
        {
            "month" => 30,
            "year" => 365,
            _ => 7
        };

        for (int i = days - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddDays(-i).Date;
            var daySales = await _db.SellerOrders
                .CountAsync(so => so.SellerId == seller.Id 
                    && so.Status == OrderStatus.Delivered
                    && so.CreatedAtUtc.Date == date);
            salesChart.Add(Math.Min(daySales * 15, 100)); // Scale for chart
        }

        // Calculate changes (simplified)
        var previousPeriodSales = await _db.SellerOrders
            .Where(so => so.SellerId == seller.Id 
                && so.Status == OrderStatus.Delivered
                && so.CreatedAtUtc < startDate)
            .CountAsync();
        
        var currentPeriodOrders = await _db.SellerOrders
            .Where(so => so.SellerId == seller.Id 
                && so.CreatedAtUtc >= startDate)
            .CountAsync();

        var ordersChange = previousPeriodSales > 0 
            ? (int)(((currentPeriodOrders - previousPeriodSales) / (double)previousPeriodSales) * 100)
            : 0;

        // Quick stats
        var conversionRate = totalProducts > 0 
            ? (currentPeriodOrders / (double)totalProducts) * 100 
            : 0;
        
        var avgOrderValue = currentPeriodOrders > 0 
            ? totalSales / currentPeriodOrders 
            : 0;

        var returningCustomers = await _db.SellerOrders
            .Where(so => so.SellerId == seller.Id)
            .Select(so => so.Order.CustomerId)
            .Distinct()
            .CountAsync();

        return new SellerDashboardDto
        {
            ShopName = seller.ShopName,
            IsVerified = seller.IsApproved,
            TotalProducts = totalProducts,
            PendingOrders = pendingOrders,
            TotalSales = totalSales,
            AverageRating = Math.Round(avgRating, 1),
            ProductsChange = 5,
            OrdersChange = ordersChange,
            SalesChange = 12,
            RatingChange = 2,
            ConversionRate = Math.Round(conversionRate, 1),
            AvgOrderValue = avgOrderValue,
            ReturningCustomers = returningCustomers,
            LowStockCount = lowStockCount,
            SalesChart = salesChart,
            RecentOrders = recentOrders,
            TopProducts = topProducts,
            RecentReviews = recentReviews
        };
    }

    public async Task<SellerProfileDto?> GetProfileAsync(Guid userId)
    {
        var seller = await _sellerRepository.GetByUserIdAsync(userId);
        if (seller == null)
            return null;

        return new SellerProfileDto
        {
            ShopName = seller.ShopName,
            Description = seller.Description,
            Category = seller.Category,
            EstablishedYear = seller.EstablishedYear,
            Website = seller.Website,
            OwnerName = seller.OwnerName,
            OwnerEmail = seller.OwnerEmail,
            OwnerPhone = seller.OwnerPhone,
            OwnerAddress = seller.OwnerAddress,
            BusinessType = seller.BusinessType,
            TaxId = seller.TaxId,
            BusinessLicense = seller.BusinessLicense,
            BankAccountName = seller.BankAccountName,
            BankAccountNumber = seller.BankAccountNumber,
            BankName = seller.BankName,
            BankBranch = seller.BankBranch,
            ReturnPolicy = seller.ReturnPolicy,
            ShippingPolicy = seller.ShippingPolicy,
            ProcessingTime = seller.ProcessingTime,
            AcceptsCOD = seller.AcceptsCOD,
            IsApproved = seller.IsApproved,
            RejectionReason = seller.RejectionReason
        };
    }

    public async Task UpdateProfileAsync(Guid userId, SellerProfileDto dto)
    {
        var seller = await _sellerRepository.GetByUserIdAsync(userId)
            ?? throw new InvalidOperationException("Seller profile not found.");

        // Update allowed fields
        seller.ShopName = dto.ShopName;
        seller.Description = dto.Description;
        seller.Category = dto.Category;
        seller.Website = dto.Website;
        seller.OwnerName = dto.OwnerName;
        seller.OwnerEmail = dto.OwnerEmail;
        seller.OwnerPhone = dto.OwnerPhone;
        seller.OwnerAddress = dto.OwnerAddress;
        seller.BusinessType = dto.BusinessType;
        seller.TaxId = dto.TaxId;
        seller.BusinessLicense = dto.BusinessLicense;
        seller.BankAccountName = dto.BankAccountName;
        seller.BankAccountNumber = dto.BankAccountNumber;
        seller.BankName = dto.BankName;
        seller.BankBranch = dto.BankBranch;
        seller.ReturnPolicy = dto.ReturnPolicy;
        seller.ShippingPolicy = dto.ShippingPolicy;
        seller.ProcessingTime = dto.ProcessingTime;
        seller.AcceptsCOD = dto.AcceptsCOD;

        _db.SellerProfiles.Update(seller);
        await _db.SaveChangesAsync();
    }

    private async Task<string?> SaveDocumentIfExists(IFormFile? file, string docType)
    {
        if (file == null || file.Length == 0)
            return null;

        try
        {
            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "seller-documents");
            
            // Create directory if it doesn't exist
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var fileName = $"{docType}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return URL path (relative to wwwroot)
            return $"/uploads/seller-documents/{fileName}";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving document: {ex.Message}");
            return null;
        }
    }

    private static string Slugify(string input)
        => input.Trim().ToLowerInvariant().Replace(" ", "-");
}
