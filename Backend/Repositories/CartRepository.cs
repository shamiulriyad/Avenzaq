using Backend.Data;
using Backend.Interfaces.Repositories;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class CartRepository : ICartRepository
{
    private readonly MarketplaceDbContext _db;

    public CartRepository(MarketplaceDbContext db)
    {
        _db = db;
    }

    public Task<Cart?> GetByCustomerIdAsync(Guid customerId)
        => _db.Carts.FirstOrDefaultAsync(c => c.CustomerId == customerId);

    public Task<Cart?> GetByCustomerIdWithItemsAsync(Guid customerId)
        => _db.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .Include(c => c.Items)
            .ThenInclude(i => i.Seller)
            .Include(c => c.Items)
            .ThenInclude(i => i.Variant)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

    public async Task AddAsync(Cart cart)
        => await _db.Carts.AddAsync(cart);

    public Task<int> SaveChangesAsync()
        => _db.SaveChangesAsync();
}
