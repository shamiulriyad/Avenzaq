import { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/notificationService';

export default function NotificationBell({ onClick, isOpen = false }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const styles = {
    container: {
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    bell: {
      fontSize: '20px',
      color: isOpen ? '#333' : '#666',
      transition: 'color 0.2s'
    },
    badge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      border: '2px solid white'
    }
  };

  return (
    <div style={styles.container} onClick={onClick}>
      <span style={styles.bell}>🔔</span>
      {unreadCount > 0 && (
        <div style={styles.badge}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
}
