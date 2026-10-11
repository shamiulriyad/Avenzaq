using Backend.Models.Entities;

namespace Backend.Interfaces.Repositories;

public interface ICartRepository
{
    Task<Cart?> GetByCustomerIdAsync(Guid customerId);
    Task<Cart?> GetByCustomerIdWithItemsAsync(Guid customerId);
    Task AddAsync(Cart cart);
    Task<int> SaveChangesAsync();
}
