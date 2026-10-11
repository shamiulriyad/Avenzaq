import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

export function useNotificationHub(onNotificationReceived) {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping SignalR connection');
      return;
    }

    // Create connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/notifications', {
        accessTokenFactory: () => token,
        withCredentials: true
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .withHubProtocol(new signalR.JsonHubProtocol())
      .build();

    // Handle connection events
    newConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      setIsConnected(true);
    });

    newConnection.onclose((error) => {
      console.log('SignalR connection closed:', error);
      setIsConnected(false);
    });

    // Receive notification event
    newConnection.on('ReceiveNotification', (notification) => {
      console.log('Received notification:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
      setUnreadCount(prev => prev + 1);
    });

    // Unread count updated event
    newConnection.on('UnreadCountUpdated', (count) => {
      console.log('Unread count updated:', count);
      setUnreadCount(count);
    });

    // Start connection
    newConnection.start()
      .then(() => {
        console.log('SignalR connected');
        setIsConnected(true);
        setConnection(newConnection);
      })
      .catch(err => {
        console.error('SignalR connection error:', err);
      });

    // Cleanup
    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [onNotificationReceived]);

  const getUnreadCount = useCallback(() => {
    if (connection && isConnected) {
      connection.invoke('GetUnreadCount')
        .catch(err => console.error('Error getting unread count:', err));
    }
  }, [connection, isConnected]);

  return {
    connection,
    isConnected,
    unreadCount,
    setUnreadCount,
    getUnreadCount
  };
}
