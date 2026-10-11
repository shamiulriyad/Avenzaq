using Backend.Models.Entities;

namespace Backend.Interfaces.Repositories;

public interface IOrderRepository
{
    Task<List<Order>> GetByCustomerIdAsync(Guid customerId);
    Task<List<SellerOrder>> GetBySellerIdAsync(Guid sellerId);
    Task<SellerOrder?> GetSellerOrderByIdAsync(Guid sellerOrderId);
    Task AddOrderAsync(Order order);
    Task<int> SaveChangesAsync();
}
