using Backend.Data;
using Backend.DTOs.Notifications;
using Backend.Interfaces.Services;
using Backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class NotificationService : INotificationService
{
    private readonly MarketplaceDbContext _db;

    public NotificationService(MarketplaceDbContext db)
    {
        _db = db;
    }

    public async Task<NotificationDto> CreateNotificationAsync(Guid userId, string title, string message, string type, Guid? relatedEntityId = null, string? relatedEntityType = null)
    {
        // Verify user exists
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            throw new InvalidOperationException("User not found.");

        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            RelatedEntityId = relatedEntityId,
            RelatedEntityType = relatedEntityType,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _db.Notifications.AddAsync(notification);
        await _db.SaveChangesAsync();

        return MapToDto(notification);
    }

    public async Task<NotificationResponseDto> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 10)
    {
        // Count total and unread FIRST, in-memory
        var total = await _db.Notifications
            .Where(n => n.UserId == userId)
            .CountAsync();
            
        var totalUnread = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();

        // THEN fetch paginated data and map in-memory (NO MapToDto in query)
        var notificationsData = await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Map in-memory only
        var notifications = notificationsData
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                RelatedEntityId = n.RelatedEntityId,
                RelatedEntityType = n.RelatedEntityType,
                CreatedAt = n.CreatedAtUtc
            })
            .ToList();

        return new NotificationResponseDto
        {
            Notifications = notifications,
            Total = total,
            TotalUnread = totalUnread
        };
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _db.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<bool> MarkAsReadAsync(Guid notificationId)
    {
        var notification = await _db.Notifications.FindAsync(notificationId);
        if (notification == null)
            return false;

        notification.IsRead = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(Guid userId)
    {
        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        if (notifications.Count == 0)
            return true;

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteNotificationAsync(Guid notificationId)
    {
        var notification = await _db.Notifications.FindAsync(notificationId);
        if (notification == null)
            return false;

        _db.Notifications.Remove(notification);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAllNotificationsAsync(Guid userId)
    {
        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        if (notifications.Count == 0)
            return true;

        _db.Notifications.RemoveRange(notifications);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task BroadcastNotificationAsync(Guid userId, NotificationDto notification)
    {
        // This will be implemented with SignalR
        // For now, just a placeholder for real-time broadcast
        await Task.CompletedTask;
    }

    private NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            RelatedEntityId = notification.RelatedEntityId,
            RelatedEntityType = notification.RelatedEntityType,
            CreatedAt = notification.CreatedAtUtc
        };
    }
}
