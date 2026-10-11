namespace Backend.Models.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;  // OrderPlaced, OrderConfirmed, OrderShipped, OrderDelivered, NewOrderForSeller, SellerApproval, PaymentSuccess, NewReview
    public bool IsRead { get; set; } = false;
    
    // Optional: Link to related entity (Order, SellerProfile, etc.)
    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }  // "Order", "SellerProfile", "Product", etc.

    // Navigation
    public User User { get; set; } = null!;
}

public static class NotificationType
{
    public const string OrderPlaced = "OrderPlaced";
    public const string OrderConfirmed = "OrderConfirmed";
    public const string OrderShipped = "OrderShipped";
    public const string OrderDelivered = "OrderDelivered";
    public const string NewOrderForSeller = "NewOrderForSeller";
    public const string SellerApprovalPending = "SellerApprovalPending";
    public const string SellerApprovalApproved = "SellerApprovalApproved";
    public const string SellerApprovalRejected = "SellerApprovalRejected";
    public const string PaymentSuccess = "PaymentSuccess";
    public const string PaymentFailed = "PaymentFailed";
    public const string NewReviewReceived = "NewReviewReceived";
    public const string ReviewReplyReceived = "ReviewReplyReceived";
}
