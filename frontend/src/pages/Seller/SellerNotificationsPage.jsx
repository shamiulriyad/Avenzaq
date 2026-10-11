import { useState } from "react";

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      title: "New Order Received",
      message: "You have received a new order #12345 from a customer.",
      timestamp: "2 hours ago",
      read: false,
      icon: "📦",
    },
    {
      id: 2,
      type: "review",
      title: "New Product Review",
      message: 'A customer left a 5-star review: "Great quality and fast shipping!"',
      timestamp: "5 hours ago",
      read: false,
      icon: "⭐",
    },
    {
      id: 3,
      type: "system",
      title: "Shop Verification Completed",
      message: "Your shop has been verified and is now eligible for premium features.",
      timestamp: "1 day ago",
      read: true,
      icon: "✅",
    },
  ]);

  const styles = {
    page: {
      padding: "24px",
      maxWidth: "900px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#111827",
    },
    badge: {
      background: "#6f55ff",
      color: "#fff",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "600",
    },
    notificationList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    notificationItem: {
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      padding: "16px",
      display: "flex",
      gap: "16px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    notificationItemUnread: {
      background: "linear-gradient(135deg, rgba(111, 85, 255, 0.04) 0%, rgba(123, 104, 238, 0.02) 100%)",
      borderColor: "#d1b3ff",
    },
    icon: {
      fontSize: "24px",
      flex: "0 0 24px",
      textAlign: "center",
    },
    content: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "4px",
    },
    notificationMessage: {
      fontSize: "13px",
      color: "#6B7280",
      marginBottom: "6px",
      lineHeight: "1.4",
    },
    timestamp: {
      fontSize: "11px",
      color: "#9CA3AF",
    },
    unreadDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "#6f55ff",
      flex: "0 0 8px",
      marginTop: "4px",
    },
    emptyState: {
      textAlign: "center",
      padding: "48px 24px",
      color: "#9CA3AF",
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#6B7280",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.borderColor = "#6f55ff";
              e.target.color = "#6f55ff";
            }}
            onMouseLeave={(e) => {
              e.target.borderColor = "#E5E7EB";
              e.target.color = "#6B7280";
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📪</div>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={styles.notificationList}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                ...styles.notificationItem,
                ...(notif.read ? {} : styles.notificationItemUnread),
              }}
              onClick={() => markAsRead(notif.id)}
            >
              <div style={styles.icon}>{notif.icon}</div>
              <div style={styles.content}>
                <div style={styles.notificationTitle}>{notif.title}</div>
                <div style={styles.notificationMessage}>{notif.message}</div>
                <div style={styles.timestamp}>{notif.timestamp}</div>
              </div>
              {!notif.read && <div style={styles.unreadDot} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
