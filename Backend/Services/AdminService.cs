using Backend.Data;
using Backend.DTOs.Admin;
using Backend.Interfaces.Services;
using Backend.Models.Entities;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AdminService : IAdminService
{
    private readonly MarketplaceDbContext _db;

    public AdminService(MarketplaceDbContext db)
    {
        _db = db;
    }

    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalSellers = await _db.SellerProfiles.CountAsync(s => s.IsApproved);
        var pendingSellerApprovals = await _db.SellerProfiles.CountAsync(s => !s.IsApproved && !s.IsRejected);
        var totalProducts = await _db.Products.CountAsync();
        var totalOrders = await _db.Orders.CountAsync(o => o.PaymentStatus == PaymentStatus.Paid);
        var platformRevenue = await _db.SellerOrders.SumAsync(x => (decimal?)x.CommissionAmount) ?? 0;

        // Get pending approvals (top 3)
        var pendingApprovals = await _db.SellerProfiles
            .Include(s => s.User)
            .Where(s => !s.IsApproved && !s.IsRejected)
            .OrderByDescending(s => s.CreatedAtUtc)
            .Take(3)
            .Select(s => new PendingApprovalDto
            {
                Id = s.Id,
                ShopName = s.ShopName,
                Owner = s.OwnerName ?? s.User.FullName,
                Email = s.OwnerEmail ?? s.User.Email ?? "N/A",
                Phone = s.OwnerPhone ?? "N/A",
                Date = s.CreatedAtUtc,
                Status = "pending"
            })
            .ToListAsync();

        // Get top sellers by revenue (top 3)
        var topSellers = await _db.SellerProfiles
            .Include(s => s.SellerOrders)
            .Where(s => s.IsApproved)
            .OrderByDescending(s => s.SellerOrders.Sum(so => so.NetAmount))
            .Take(3)
            .Select(s => new TopSellerDto
            {
                Id = s.Id,
                ShopName = s.ShopName,
                Revenue = s.SellerOrders.Sum(so => so.NetAmount),
                Orders = s.SellerOrders.Count
            })
            .ToListAsync();

        // Get recent orders (top 5)
        var recentOrders = await _db.Orders
            .Include(o => o.Customer)
            .OrderByDescending(o => o.CreatedAtUtc)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderNumber = o.Id.ToString().Substring(0, 8).ToUpper(),
                Customer = o.Customer.FullName,
                Amount = o.TotalAmount,
                Status = o.Status.ToString().ToLower(),
                Date = o.CreatedAtUtc
            })
            .ToListAsync();

        // Get recent activities (user registrations + orders)
        var recentActivities = new List<RecentActivityDto>();

        // Add recent user registrations
        var recentUsersData = await _db.Users
            .Where(u => u.Role == UserRole.Customer)
            .OrderByDescending(u => u.CreatedAtUtc)
            .Take(2)
            .Select(u => new { u.Email, u.CreatedAtUtc })
            .ToListAsync();

        foreach (var user in recentUsersData)
        {
            recentActivities.Add(new RecentActivityDto
            {
                Type = "user",
                Action = "New user registered",
                User = user.Email,
                Time = FormatTime(user.CreatedAtUtc)
            });
        }

        // Add recent seller applications
        var recentSellersData = await _db.SellerProfiles
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAtUtc)
            .Take(2)
            .Select(s => new { s.User.Email, s.CreatedAtUtc })
            .ToListAsync();

        foreach (var seller in recentSellersData)
        {
            recentActivities.Add(new RecentActivityDto
            {
                Type = "seller",
                Action = "Seller application",
                User = seller.Email,
                Time = FormatTime(seller.CreatedAtUtc)
            });
        }

        // Add recent orders
        var recentOrdersData = await _db.Orders
            .Include(o => o.Customer)
            .OrderByDescending(o => o.CreatedAtUtc)
            .Take(1)
            .Select(o => new { o.Id, o.CreatedAtUtc })
            .ToListAsync();

        foreach (var order in recentOrdersData)
        {
            recentActivities.Add(new RecentActivityDto
            {
                Type = "order",
                Action = "New order placed",
                User = $"Order #{order.Id.ToString().Substring(0, 8).ToUpper()}",
                Time = FormatTime(order.CreatedAtUtc)
            });
        }

        // Calculate alerts
        var alerts = new AlertsDto();

        // Low stock products (stock <= 10)
        alerts.LowStockProducts = await _db.Products
            .CountAsync(p => p.StockQty <= 10);

        // Pending seller approvals
        alerts.PendingSellerApprovals = pendingSellerApprovals;

        // New orders (created in last 24 hours)
        var oneDayAgo = DateTime.UtcNow.AddHours(-24);
        alerts.NewOrders = await _db.Orders
            .CountAsync(o => o.CreatedAtUtc >= oneDayAgo);

        // Failed payments (orders with failed payment status)
        alerts.FailedPayments = await _db.Orders
            .CountAsync(o => o.PaymentStatus == PaymentStatus.Failed);

        // Suspicious activity (inactive products)
        alerts.SuspiciousActivity = await _db.Products
            .CountAsync(p => !p.IsActive);

        return new AdminDashboardDto
        {
            TotalUsers = totalUsers,
            TotalSellers = totalSellers,
            PendingSellerApprovals = pendingSellerApprovals,
            TotalProducts = totalProducts,
            TotalOrders = totalOrders,
            PlatformRevenue = platformRevenue,
            PendingApprovals = pendingApprovals,
            TopSellers = topSellers,
            RecentOrders = recentOrders,
            RecentActivities = recentActivities,
            Alerts = alerts
        };
    }

    private static string FormatTime(DateTime utcTime)
    {
        var timeSpan = DateTime.UtcNow - utcTime;
        
        if (timeSpan.TotalSeconds < 60)
            return "just now";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes}m ago";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours}h ago";
        if (timeSpan.TotalDays < 7)
            return $"{(int)timeSpan.TotalDays}d ago";
        
        return utcTime.ToString("MMM dd, yyyy");
    }

    public async Task<bool> ApproveSellerAsync(Guid sellerId)
    {
        var seller = await _db.SellerProfiles.FirstOrDefaultAsync(x => x.Id == sellerId);
        if (seller == null)
        {
            return false;
        }

        seller.IsApproved = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task CreateFeaturedPromotionAsync(CreateFeaturedPromotionDto dto)
    {
        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == dto.ProductId)
            ?? throw new InvalidOperationException("Product not found.");

        var promotion = new FeaturedPromotion
        {
            ProductId = product.Id,
            SellerId = product.SellerId,
            StartAtUtc = dto.StartAtUtc,
            EndAtUtc = dto.EndAtUtc,
            AmountPaid = dto.AmountPaid,
            IsActive = true
        };

        await _db.FeaturedPromotions.AddAsync(promotion);
        await _db.SaveChangesAsync();
    }

    public async Task<List<AdminPromotionDto>> GetFeaturedPromotionsAsync()
    {
        return await _db.FeaturedPromotions
            .Include(fp => fp.Product)
            .OrderByDescending(fp => fp.CreatedAtUtc)
            .Select(fp => new AdminPromotionDto
            {
                Id = fp.Id,
                ProductId = fp.ProductId,
                ProductName = fp.Product.Name,
                StartAtUtc = fp.StartAtUtc,
                EndAtUtc = fp.EndAtUtc,
                AmountPaid = fp.AmountPaid,
                IsActive = fp.IsActive
            })
            .ToListAsync();
    }

    public async Task<bool> UpdateFeaturedPromotionAsync(Guid promotionId, CreateFeaturedPromotionDto dto)
    {
        var promotion = await _db.FeaturedPromotions.FirstOrDefaultAsync(x => x.Id == promotionId);
        if (promotion == null)
        {
            return false;
        }

        var product = await _db.Products.FirstOrDefaultAsync(x => x.Id == dto.ProductId);
        if (product == null)
        {
            return false;
        }

        promotion.ProductId = product.Id;
        promotion.SellerId = product.SellerId;
        promotion.StartAtUtc = dto.StartAtUtc;
        promotion.EndAtUtc = dto.EndAtUtc;
        promotion.AmountPaid = dto.AmountPaid;
        promotion.IsActive = dto.EndAtUtc >= DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteFeaturedPromotionAsync(Guid promotionId)
    {
        var promotion = await _db.FeaturedPromotions.FirstOrDefaultAsync(x => x.Id == promotionId);
        if (promotion == null)
        {
            return false;
        }

        _db.FeaturedPromotions.Remove(promotion);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<AdminSellerDto>> GetSellersAsync()
    {
        return await _db.SellerProfiles
            .Include(s => s.User)
            .Include(s => s.Products)
            .Include(s => s.SellerOrders)
            .Where(s => s.User.Role == UserRole.Seller)
            .OrderByDescending(s => s.CreatedAtUtc)
            .Select(s => new AdminSellerDto
            {
                Id = s.Id,
                ShopName = s.ShopName,
                ShopSlug = s.ShopSlug,
                Description = s.Description,
                Category = s.Category,
                EstablishedYear = s.EstablishedYear,
                Website = s.Website,
                OwnerName = s.OwnerName ?? s.User.FullName,
                OwnerEmail = s.OwnerEmail ?? s.User.Email,
                OwnerPhone = s.OwnerPhone,
                OwnerAddress = s.OwnerAddress,
                Email = s.User.Email,
                OwnerIdType = s.OwnerIdType,
                OwnerIdNumber = s.OwnerIdNumber,
                BusinessType = s.BusinessType,
                TaxId = s.TaxId,
                BusinessLicense = s.BusinessLicense,
                NidDocumentUrl = s.NidDocumentUrl,
                TradeLicenseUrl = s.TradeLicenseUrl,
                TinDocumentUrl = s.TinDocumentUrl,
                BankStatementUrl = s.BankStatementUrl,
                BankAccountName = s.BankAccountName,
                BankAccountNumber = s.BankAccountNumber,
                BankName = s.BankName,
                BankBranch = s.BankBranch,
                ReturnPolicy = s.ReturnPolicy,
                ShippingPolicy = s.ShippingPolicy,
                ProcessingTime = s.ProcessingTime,
                AcceptsCOD = s.AcceptsCOD,
                LogoUrl = s.LogoUrl,
                BannerUrl = s.BannerUrl,
                Location = s.Location,
                Status = s.IsRejected ? "rejected" : !s.User.IsActive ? "suspended" : s.IsApproved ? "approved" : "pending",
                Verified = s.IsApproved,
                IsRejected = s.IsRejected,
                RejectionReason = s.RejectionReason,
                TotalProducts = s.Products.Count,
                TotalOrders = s.SellerOrders.Count,
                TotalRevenue = s.SellerOrders.Sum(so => so.NetAmount),
                Rating = null,
                CreatedAt = s.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<bool> RejectSellerAsync(Guid sellerId)
    {
        var seller = await _db.SellerProfiles
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == sellerId);

        if (seller == null)
        {
            return false;
        }

        seller.IsApproved = false;
        seller.IsRejected = true;
        seller.RejectionReason = "Application rejected by admin";

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SuspendSellerAsync(Guid sellerId)
    {
        var seller = await _db.SellerProfiles
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == sellerId);

        if (seller == null)
        {
            return false;
        }

        seller.User.IsActive = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<object>> GetUsersAsync()
    {
        return await _db.Users
            .Include(u => u.Orders)
            .Where(u => u.Role == UserRole.Customer)
            .OrderByDescending(u => u.CreatedAtUtc)
            .Select(u => new
            {
                id = u.Id,
                name = u.FullName,
                email = u.Email,
                phone = u.Phone ?? "",
                totalOrders = u.Orders.Count,
                totalSpent = u.Orders.Sum(o => o.TotalAmount),
                status = u.IsActive ? "active" : "blocked",
                joinDate = u.CreatedAtUtc,
                avatar = u.Avatar ?? "",
                location = "",
                address = "",
                flagged = false,
                orders = u.Orders.Select(o => new
                {
                    id = o.Id,
                    date = o.CreatedAtUtc,
                    amount = o.TotalAmount,
                    status = o.Status.ToString().ToLower()
                }).ToList()
            })
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<bool> BlockUserAsync(Guid userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return false;
        }

        user.IsActive = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnblockUserAsync(Guid userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return false;
        }

        user.IsActive = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<object>> GetProductsAsync()
    {
        return await _db.Products
            .Include(p => p.Seller)
            .Include(p => p.Category)
            .Where(p => p.Seller.IsApproved)
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => new
            {
                id = p.Id,
                name = p.Name,
                emoji = "📦",
                sku = p.Id.ToString().Substring(0, 8).ToUpper(),
                category = p.Category.Name,
                seller = p.Seller.ShopName ?? p.Seller.User.FullName,
                status = p.IsActive ? "active" : "hidden",
                stock = p.StockQty,
                price = p.Price,
                createdAt = p.CreatedAtUtc,
                flagged = false
            })
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<List<object>> GetOrdersAsync()
    {
        return await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.SellerOrders)
                .ThenInclude(so => so.Seller)
                    .ThenInclude(s => s.User)
            .Include(o => o.SellerOrders)
                .ThenInclude(so => so.Items)
                    .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new
            {
                id = o.Id.ToString().Substring(0, 8).ToUpper(),
                customer = new
                {
                    name = o.Customer.FullName,
                    email = o.Customer.Email,
                    phone = o.Customer.Phone ?? ""
                },
                seller = o.SellerOrders.FirstOrDefault() != null
                    ? (o.SellerOrders.First().Seller.ShopName ?? o.SellerOrders.First().Seller.User.FullName)
                    : "N/A",
                address = o.ShippingAddress,
                items = o.SellerOrders
                    .SelectMany(so => so.Items)
                    .Select(oi => new
                    {
                        id = oi.Id,
                        name = oi.Product.Name,
                        price = oi.UnitPrice,
                        qty = oi.Quantity,
                        emoji = "📦"
                    })
                    .ToList(),
                subtotal = o.SellerOrders.Sum(so => so.Subtotal),
                shipping = 0m,
                total = o.TotalAmount,
                orderStatus = o.Status.ToString().ToLower(),
                paymentStatus = o.PaymentStatus.ToString().ToLower(),
                paymentMethod = "Bank Transfer",
                createdAt = o.CreatedAtUtc,
                flagged = false
            })
            .Cast<object>()
            .ToListAsync();
    }
}
