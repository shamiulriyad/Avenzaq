using Backend.DTOs.Notifications;
using Backend.Interfaces.Services;
using Backend.Security;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs;

public class NotificationHub : Hub
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(INotificationService notificationService, ILogger<NotificationHub> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = Context.User?.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                // Add user to group for targeted notifications
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
                _logger.LogInformation($"User {userId} connected to notifications hub");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error on connected");
        }
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var userId = Context.User?.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation($"User {userId} disconnected from notifications hub");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error on disconnected");
        }
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Get unread count for current user
    /// </summary>
    public async Task GetUnreadCount()
    {
        try
        {
            var userId = Context.User?.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userIdGuid))
            {
                await Clients.Caller.SendAsync("UnreadCountUpdated", 0);
                return;
            }

            var count = await _notificationService.GetUnreadCountAsync(userIdGuid);
            await Clients.Caller.SendAsync("UnreadCountUpdated", count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count");
        }
    }

    /// <summary>
    /// Broadcast notification to specific user
    /// </summary>
    public async Task SendNotificationToUser(Guid userId, NotificationDto notification)
    {
        try
        {
            await Clients.Group($"user-{userId}")
                .SendAsync("ReceiveNotification", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification");
        }
    }

    /// <summary>
    /// Broadcast notification to all connected users
    /// </summary>
    public async Task BroadcastNotificationToAll(NotificationDto notification)
    {
        try
        {
            await Clients.All.SendAsync("ReceiveNotification", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting notification");
        }
    }
}
