import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead } from '../services/notificationService';

export default function NotificationDropdown({ isOpen = false, onClose, onNotificationsUpdated }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(1, 5);
      setNotifications(data.notifications);
      setTotalUnread(data.totalUnread);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setTotalUnread(prev => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      if (notification.relatedEntityType === 'Order') {
        navigate(`/orders/${notification.relatedEntityId}`);
      } else if (notification.relatedEntityType === 'Product') {
        navigate(`/products/${notification.relatedEntityId}`);
      } else if (notification.relatedEntityType === 'SellerOrder') {
        navigate('/seller/orders');
      }

      onClose?.();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      OrderPlaced: '🛒',
      OrderConfirmed: '✅',
      OrderShipped: '📦',
      OrderDelivered: '🏪',
      NewOrderForSeller: '📬',
      SellerApprovalApproved: '🎉',
      SellerApprovalRejected: '❌',
      PaymentSuccess: '💳',
      PaymentFailed: '⚠️',
      NewReviewReceived: '⭐',
      ReviewReplyReceived: '💬',
      SellerApprovalPending: '⏳'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (isRead) => {
    return isRead ? '#f3f4f6' : '#fef3c7';
  };

  const styles = {
    container: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      width: '400px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxHeight: '500px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      padding: '12px 16px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9fafb'
    },
    headerTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937'
    },
    unreadBadge: {
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '12px',
      padding: '2px 8px',
      fontSize: '12px',
      fontWeight: '600'
    },
    list: {
      overflowY: 'auto',
      maxHeight: '350px',
      flex: 1
    },
    notification: {
      padding: '12px 16px',
      borderBottom: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      gap: '12px'
    },
    notificationHover: {
      opacity: 0.9
    },
    notificationIcon: {
      fontSize: '24px',
      minWidth: '24px'
    },
    notificationContent: {
      flex: 1,
      minWidth: 0
    },
    notificationTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px'
    },
    notificationMessage: {
      fontSize: '13px',
      color: '#6b7280',
      marginBottom: '4px',
      lineHeight: '1.4'
    },
    notificationTime: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    footer: {
      padding: '12px 16px',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center',
      backgroundColor: '#f9fafb'
    },
    footerLink: {
      color: '#3b82f6',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      textDecoration: 'none'
    },
    emptyState: {
      padding: '32px 16px',
      textAlign: 'center',
      color: '#9ca3af'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '8px'
    },
    emptyText: {
      fontSize: '14px'
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Notifications</span>
        {totalUnread > 0 && (
          <span style={styles.unreadBadge}>{totalUnread} New</span>
        )}
      </div>

      <div style={styles.list}>
        {loading ? (
          <div style={styles.emptyState}>
            <div>Loading...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyText}>No notifications yet</div>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                ...styles.notification,
                backgroundColor: getNotificationColor(notification.isRead)
              }}
              onClick={() => handleNotificationClick(notification)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = getNotificationColor(notification.isRead);
              }}
            >
              <div style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </div>
              <div style={styles.notificationContent}>
                <div style={styles.notificationTitle}>
                  {notification.title}
                  {!notification.isRead && (
                    <span style={{ marginLeft: '6px', color: '#ef4444' }}>●</span>
                  )}
                </div>
                <div style={styles.notificationMessage}>
                  {notification.message}
                </div>
                <div style={styles.notificationTime}>
                  {formatTime(notification.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.footer}>
        <button
          onClick={() => {
            navigate('/notifications');
            onClose?.();
          }}
          style={{
            ...styles.footerLink,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
}
