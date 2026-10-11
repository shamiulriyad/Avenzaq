using Backend.DTOs.Notifications;

namespace Backend.Interfaces.Services;

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(Guid userId, string title, string message, string type, Guid? relatedEntityId = null, string? relatedEntityType = null);
    Task<NotificationResponseDto> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 10);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task<bool> MarkAsReadAsync(Guid notificationId);
    Task<bool> MarkAllAsReadAsync(Guid userId);
    Task<bool> DeleteNotificationAsync(Guid notificationId);
    Task<bool> DeleteAllNotificationsAsync(Guid userId);
    Task BroadcastNotificationAsync(Guid userId, NotificationDto notification);
}
