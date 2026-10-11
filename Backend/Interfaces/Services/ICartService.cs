using Backend.DTOs.Cart;

namespace Backend.Interfaces.Services;

public interface ICartService
{
    Task<CartDto> GetAsync(Guid customerId);
    Task<CartDto> AddItemAsync(Guid customerId, AddCartItemDto dto);
    Task<CartDto> UpdateItemAsync(Guid customerId, Guid itemId, int quantity);
    Task<CartDto> RemoveItemAsync(Guid customerId, Guid itemId);
}
