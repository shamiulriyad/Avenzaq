import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, deleteNotification, markAllAsRead, deleteAllNotifications } from '../../services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(page, pageSize);
      setNotifications(data.notifications);
      setTotalUnread(data.totalUnread);
      setTotal(data.total);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setTotalUnread(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setTotalUnread(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure? This will delete all your notifications.')) {
      try {
        await deleteAllNotifications();
        setNotifications([]);
        setTotal(0);
        setTotalUnread(0);
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '32px 16px'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '16px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280'
    },
    toolbar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    notificationItem: {
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s',
      display: 'grid',
      gridTemplateColumns: '40px 1fr auto',
      gap: '16px',
      alignItems: 'start'
    },
    notificationItemUnread: {
      backgroundColor: '#fef3c7',
      borderColor: '#fbbf24'
    },
    icon: {
      fontSize: '24px',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      flex: 1
    },
    itemTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px'
    },
    message: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px',
      lineHeight: '1.5'
    },
    meta: {
      fontSize: '12px',
      color: '#9ca3af',
      display: 'flex',
      gap: '12px'
    },
    actions: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      padding: '6px 12px',
      borderRadius: '4px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      color: '#6b7280',
      transition: 'all 0.2s'
    },
    pagination: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      marginTop: '32px',
      alignItems: 'center'
    },
    pageButton: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '64px 32px',
      color: '#9ca3af'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px'
    },
    emptyText: {
      fontSize: '16px',
      marginBottom: '8px',
      color: '#6b7280'
    },
    emptySubtext: {
      fontSize: '14px',
      color: '#9ca3af'
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Notifications</h1>
        <p style={styles.subtitle}>
          {total} total • {totalUnread} unread
        </p>
      </div>

      {total > 0 && (
        <div style={styles.toolbar}>
          {totalUnread > 0 && (
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
          <button
            style={{ ...styles.button, ...styles.dangerButton }}
            onClick={handleClearAll}
          >
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div>Loading notifications...</div>
        </div>
      ) : notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <div style={styles.emptyText}>No notifications yet</div>
          <div style={styles.emptySubtext}>
            Your notifications will appear here
          </div>
        </div>
      ) : (
        <>
          <div style={styles.list}>
            {notifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  ...styles.notificationItem,
                  ...(notification.isRead ? {} : styles.notificationItemUnread)
                }}
              >
                <div style={styles.icon}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={styles.content}>
                  <div style={styles.itemTitle}>
                    {notification.title}
                    {!notification.isRead && (
                      <span style={{ marginLeft: '8px', color: '#ef4444' }}>New</span>
                    )}
                  </div>
                  <div style={styles.message}>{notification.message}</div>
                  <div style={styles.meta}>
                    <span>{formatDate(notification.createdAt)}</span>
                    <span>Type: {notification.type}</span>
                  </div>
                </div>
                <div style={styles.actions}>
                  {!notification.isRead && (
                    <button
                      style={styles.actionButton}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    style={styles.actionButton}
                    onClick={() => handleDelete(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={styles.pageButton}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  style={{
                    ...styles.pageButton,
                    backgroundColor: p === page ? '#3b82f6' : 'white',
                    color: p === page ? 'white' : '#1f2937'
                  }}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              
              <button
                style={styles.pageButton}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
