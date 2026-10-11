using Backend.Data;
using Backend.DTOs.Orders;
using Backend.Interfaces.Repositories;
using Backend.Interfaces.Services;
using Backend.Models.Entities;
using Backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class OrderService : IOrderService
{
    private readonly MarketplaceDbContext _db;
    private readonly ICartRepository _cartRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly ISellerRepository _sellerRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        MarketplaceDbContext db,
        ICartRepository cartRepository,
        IOrderRepository orderRepository,
        ISellerRepository sellerRepository,
        INotificationService notificationService,
        ILogger<OrderService> logger)
    {
        _db = db;
        _cartRepository = cartRepository;
        _orderRepository = orderRepository;
        _sellerRepository = sellerRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Guid> CheckoutAsync(Guid customerId, CheckoutRequestDto dto)
    {
        var cart = await _cartRepository.GetByCustomerIdWithItemsAsync(customerId);
        if (cart == null || !cart.Items.Any())
        {
            throw new InvalidOperationException("Cart is empty.");
        }

        using var tx = await _db.Database.BeginTransactionAsync();

        var order = new Order
        {
            CustomerId = customerId,
            ShippingAddress = dto.ShippingAddress,
            Status = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Pending,
            TotalAmount = cart.Items.Sum(i => i.FinalPrice * i.Quantity)
        };

        await _orderRepository.AddOrderAsync(order);

        var grouped = cart.Items.GroupBy(i => i.SellerId);
        foreach (var group in grouped)
        {
            var sellerId = group.Key;
            var subtotal = group.Sum(x => x.FinalPrice * x.Quantity);
            var commissionRate = await _sellerRepository.GetCommissionRateAsync(sellerId);
            var commissionAmount = subtotal * commissionRate;

            var sellerOrder = new SellerOrder
            {
                OrderId = order.Id,
                SellerId = sellerId,
                Subtotal = subtotal,
                CommissionAmount = commissionAmount,
                NetAmount = subtotal - commissionAmount,
                Status = OrderStatus.Pending
            };

            _db.SellerOrders.Add(sellerOrder);

            foreach (var item in group)
            {
                if (item.VariantId.HasValue)
                {
                    var variant = await _db.ProductVariants.FirstOrDefaultAsync(v => v.Id == item.VariantId.Value);
                    if (variant == null)
                    {
                        throw new InvalidOperationException("Selected variant is no longer available.");
                    }

                    if (variant.Stock < item.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for {item.Product.Name} variant.");
                    }

                    variant.Stock -= item.Quantity;
                }
                else
                {
                    if (item.Product.StockQty < item.Quantity)
                    {
                        throw new InvalidOperationException($"Insufficient stock for {item.Product.Name}.");
                    }

                    item.Product.StockQty -= item.Quantity;
                }

                _db.OrderItems.Add(new OrderItem
                {
                    SellerOrderId = sellerOrder.Id,
                    SellerId = sellerId,
                    ProductId = item.ProductId,
                    VariantId = item.VariantId,
                    Quantity = item.Quantity,
                    OriginalPrice = item.OriginalPrice,
                    FinalPrice = item.FinalPrice,
                    DiscountAmount = item.DiscountAmount,
                    DiscountApplied = item.DiscountApplied,
                    UnitPrice = item.FinalPrice,
                    LineTotal = item.Quantity * item.FinalPrice
                });
            }
        }

        _db.CartItems.RemoveRange(cart.Items);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        // Send notifications
        try
        {
            // Notify customer
            await _notificationService.CreateNotificationAsync(
                customerId,
                "Order Placed",
                $"Your order #{order.Id.ToString().Substring(0, 8)} has been placed successfully.",
                Models.Entities.NotificationType.OrderPlaced,
                order.Id,
                "Order"
            );

            // Notify each seller about the new order
            foreach (var sellerOrder in order.SellerOrders)
            {
                var seller = await _sellerRepository.GetByIdAsync(sellerOrder.SellerId);
                if (seller != null)
                {
                    await _notificationService.CreateNotificationAsync(
                        seller.UserId,
                        "New Order Received",
                        $"You have a new order #{order.Id.ToString().Substring(0, 8)} with {sellerOrder.Items.Count} item(s).",
                        Models.Entities.NotificationType.NewOrderForSeller,
                        sellerOrder.Id,
                        "SellerOrder"
                    );
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notifications for new order");
        }

        return order.Id;
    }

    public async Task<List<OrderDto>> GetCustomerOrdersAsync(Guid customerId)
    {
        var orders = await _orderRepository.GetByCustomerIdAsync(customerId);
        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            PaymentStatus = o.PaymentStatus,
            CreatedAtUtc = o.CreatedAtUtc,
            ShippingAddress = o.ShippingAddress,
            Items = o.SellerOrders
                .SelectMany(so => so.Items.Select(item => new OrderItemDto
                {
                    ProductId = item.ProductId,
                    VariantId = item.VariantId,
                    SellerId = so.SellerId,
                    ProductName = item.Product?.Name ?? string.Empty,
                    ProductSlug = item.Product?.Slug ?? string.Empty,
                    CategoryName = item.Product?.Category?.Name ?? string.Empty,
                    SellerShopName = so.Seller?.ShopName ?? string.Empty,
                    PrimaryImageUrl = item.Product?.Images.FirstOrDefault(image => image.IsPrimary)?.ImageUrl,
                    Quantity = item.Quantity,
                    OriginalPrice = item.OriginalPrice,
                    FinalPrice = item.FinalPrice,
                    DiscountAmount = item.DiscountAmount,
                    DiscountApplied = item.DiscountApplied,
                    UnitPrice = item.UnitPrice,
                    LineTotal = item.LineTotal
                }))
                .ToList(),
            SellerOrders = o.SellerOrders.Select(so => new SellerOrderDto
            {
                Id = so.Id,
                SellerId = so.SellerId,
                Subtotal = so.Subtotal,
                CommissionAmount = so.CommissionAmount,
                NetAmount = so.NetAmount,
                Status = so.Status
            }).ToList()
        }).ToList();
    }

    public async Task<List<SellerOrderDto>> GetSellerOrdersAsync(Guid sellerUserId)
    {
        var seller = await _sellerRepository.GetByUserIdAsync(sellerUserId)
            ?? throw new InvalidOperationException("Seller profile not found.");

        if (!seller.IsApproved)
        {
            throw new UnauthorizedAccessException("Seller profile is pending admin approval.");
        }

        var sellerOrders = await _orderRepository.GetBySellerIdAsync(seller.Id);
        return sellerOrders.Select(so => new SellerOrderDto
        {
            Id = so.Id,
            SellerId = so.SellerId,
            Subtotal = so.Subtotal,
            CommissionAmount = so.CommissionAmount,
            NetAmount = so.NetAmount,
            Status = so.Status
        }).ToList();
    }

    public async Task<bool> UpdateSellerOrderStatusAsync(Guid sellerUserId, Guid sellerOrderId, OrderStatus status)
    {
        var seller = await _sellerRepository.GetByUserIdAsync(sellerUserId);
        if (seller == null)
        {
            return false;
        }

        if (!seller.IsApproved)
        {
            throw new UnauthorizedAccessException("Seller profile is pending admin approval.");
        }

        var sellerOrder = await _orderRepository.GetSellerOrderByIdAsync(sellerOrderId);
        if (sellerOrder == null || sellerOrder.SellerId != seller.Id)
        {
            return false;
        }

        sellerOrder.Status = status;
        await _orderRepository.SaveChangesAsync();

        // Send notifications to customer
        try
        {
            var order = await _db.Orders.FindAsync(sellerOrder.OrderId);
            if (order != null)
            {
                string notificationType = status switch
                {
                    OrderStatus.Confirmed => Models.Entities.NotificationType.OrderConfirmed,
                    OrderStatus.Shipped => Models.Entities.NotificationType.OrderShipped,
                    OrderStatus.Delivered => Models.Entities.NotificationType.OrderDelivered,
                    _ => Models.Entities.NotificationType.OrderConfirmed
                };

                string message = status switch
                {
                    OrderStatus.Confirmed => "Your order has been confirmed by the seller.",
                    OrderStatus.Shipped => "Your order has been shipped! Check the tracking details.",
                    OrderStatus.Delivered => "Your order has been delivered!",
                    _ => "Your order status has been updated."
                };

                await _notificationService.CreateNotificationAsync(
                    order.CustomerId,
                    $"Order {status}",
                    message,
                    notificationType,
                    order.Id,
                    "Order"
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending order status notification");
        }

        return true;
    }
}
