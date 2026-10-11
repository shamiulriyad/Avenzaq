import { useState, useCallback } from 'react';
import NotificationBell from '../notifications/NotificationBell';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { useNotificationHub } from '../../hooks/useNotificationHub';

export default function NavbarWithNotifications() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentNotification, setRecentNotification] = useState(null);

  // Setup SignalR connection
  const { isConnected, unreadCount, getUnreadCount } = useNotificationHub((notification) => {
    // Handle incoming notification
    setRecentNotification(notification);
    // Play sound or show toast if needed
    console.log('New notification from hub:', notification);
  });

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      getUnreadCount();
    }
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const styles = {
    navbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    navContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      flex: 1
    },
    logo: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1f2937'
    },
    navLinks: {
      display: 'flex',
      gap: '24px',
      flex: 1
    },
    navLink: {
      textDecoration: 'none',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'color 0.2s'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    notificationWrapper: {
      position: 'relative'
    },
    connectionStatus: {
      fontSize: '12px',
      color: isConnected ? '#10b981' : '#ef4444'
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContent}>
        <div style={styles.logo}>Marketplace</div>
        <div style={styles.navLinks}>
          <a href="/" style={styles.navLink} onMouseEnter={e => e.target.style.color = '#1f2937'} onMouseLeave={e => e.target.style.color = '#6b7280'}>
            Home
          </a>
          <a href="/products" style={styles.navLink} onMouseEnter={e => e.target.style.color = '#1f2937'} onMouseLeave={e => e.target.style.color = '#6b7280'}>
            Products
          </a>
          <a href="/orders" style={styles.navLink} onMouseEnter={e => e.target.style.color = '#1f2937'} onMouseLeave={e => e.target.style.color = '#6b7280'}>
            Orders
          </a>
        </div>
      </div>

      <div style={styles.rightSection}>
        <span style={styles.connectionStatus}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </span>

        <div style={styles.notificationWrapper}>
          <NotificationBell
            onClick={handleBellClick}
            isOpen={isDropdownOpen}
          />
          {isDropdownOpen && (
            <NotificationDropdown
              isOpen={isDropdownOpen}
              onClose={handleDropdownClose}
            />
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * INTEGRATION GUIDE:
 * 
 * 1. Replace your existing Navbar with this component
 * 2. Install SignalR client package:
 *    npm install @microsoft/signalr
 * 
 * 3. Update your main App.js/App.jsx to use the new navbar:
 *    See example at bottom of file after comment closing
 * 
 * 4. The notification bell will show:
 *    - Unread count badge
 *    - Recent notifications in dropdown
 *    - Real-time updates via SignalR
 * 
 * 5. Click any notification to navigate to related entity
 * 
 * 6. Visit /notifications for full notification history
 */
