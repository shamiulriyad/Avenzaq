using Backend.DTOs.Orders;
using Backend.Interfaces.Services;
using Backend.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost("checkout")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<object>> Checkout([FromBody] CheckoutRequestDto dto)
    {
        var orderId = await _orderService.CheckoutAsync(User.GetUserId(), dto);
        return Ok(new { orderId });
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<List<OrderDto>>> MyOrders()
    {
        var orders = await _orderService.GetCustomerOrdersAsync(User.GetUserId());
        return Ok(orders);
    }
}
