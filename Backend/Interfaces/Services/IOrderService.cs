using Backend.DTOs.Orders;
using Backend.Models.Enums;

namespace Backend.Interfaces.Services;

public interface IOrderService
{
    Task<Guid> CheckoutAsync(Guid customerId, CheckoutRequestDto dto);
    Task<List<OrderDto>> GetCustomerOrdersAsync(Guid customerId);
    Task<List<SellerOrderDto>> GetSellerOrdersAsync(Guid sellerUserId);
    Task<bool> UpdateSellerOrderStatusAsync(Guid sellerUserId, Guid sellerOrderId, OrderStatus status);
}
