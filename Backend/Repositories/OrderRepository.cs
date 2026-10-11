using Backend.Data;
using Backend.Interfaces.Repositories;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly MarketplaceDbContext _db;

    public OrderRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public async Task<List<Order>> GetByCustomerIdAsync(Guid customerId)
        => await _db.Orders
            .Include(o => o.SellerOrders)
            .ThenInclude(so => so.Seller)
            .Include(o => o.SellerOrders)
            .ThenInclude(so => so.Items)
            .ThenInclude(item => item.Product)
            .ThenInclude(product => product.Category)
            .Include(o => o.SellerOrders)
            .ThenInclude(so => so.Items)
            .ThenInclude(item => item.Product)
            .ThenInclude(product => product.Images)
            .Include(o => o.SellerOrders)
            .ThenInclude(so => so.Items)
            .ThenInclude(item => item.Seller)
            .Include(o => o.SellerOrders)
            .ThenInclude(so => so.Items)
            .ThenInclude(item => item.Variant)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync();

    public async Task<List<SellerOrder>> GetBySellerIdAsync(Guid sellerId)
        => await _db.SellerOrders
            .Include(so => so.Order)
            .Where(so => so.SellerId == sellerId)
            .OrderByDescending(so => so.CreatedAtUtc)
            .ToListAsync();

    public Task<SellerOrder?> GetSellerOrderByIdAsync(Guid sellerOrderId)
        => _db.SellerOrders.FirstOrDefaultAsync(so => so.Id == sellerOrderId);

    public async Task AddOrderAsync(Order order)
        => await _db.Orders.AddAsync(order);

    public Task<int> SaveChangesAsync()
        => _db.SaveChangesAsync();
}
