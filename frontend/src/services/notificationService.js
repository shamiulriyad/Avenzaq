import apiClient from './apiClient';

// Get all notifications with pagination
export async function getNotifications(page = 1, pageSize = 10) {
  const { data } = await apiClient.get('/notifications', {
    params: { page, pageSize }
  });
  return data;
}

// Get unread notification count
export async function getUnreadCount() {
  const { data } = await apiClient.get('/notifications/unread-count');
  return data.unreadCount;
}

// Mark a specific notification as read
export async function markAsRead(notificationId) {
  const { data } = await apiClient.put(`/notifications/${notificationId}/read`);
  return data;
}

// Mark all notifications as read
export async function markAllAsRead() {
  const { data } = await apiClient.put('/notifications/read-all');
  return data;
}

// Delete a notification
export async function deleteNotification(notificationId) {
  const { data } = await apiClient.delete(`/notifications/${notificationId}`);
  return data;
}

// Delete all notifications
export async function deleteAllNotifications() {
  const { data } = await apiClient.delete('/notifications/clear-all');
  return data;
}
