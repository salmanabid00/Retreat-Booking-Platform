import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import API from '../api/axios';

const SocketContext = createContext();

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);

  // Fetch initial unread notifications count
  const fetchUnreadNotifs = async () => {
    if (!token) return;
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setUnreadNotificationsCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    fetchUnreadNotifs();

    // Initialize Socket Connection with Auth Handshake
    const newSocket = io(SOCKET_SERVER_URL, {
      auth: { token },
      query: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket Connected]:', newSocket.id);
    });

    // Listen for Online User Status Updates
    newSocket.on('userOnlineStatus', ({ onlineUserIds }) => {
      if (onlineUserIds) {
        setOnlineUsers(new Set(onlineUserIds));
      }
    });

    // Listen for Live Notifications
    newSocket.on('newNotification', (notif) => {
      setUnreadNotificationsCount((prev) => prev + 1);
      setToastNotification(notif);
      setTimeout(() => setToastNotification(null), 5000);
    });

    newSocket.on('newUnreadMessageNotification', (data) => {
      setUnreadNotificationsCount((prev) => prev + 1);
      setToastNotification({
        message: `New message from ${data.senderName}: ${data.messageSnippet}`,
        type: 'new_message',
      });
      setTimeout(() => setToastNotification(null), 5000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        toastNotification,
        clearToast: () => setToastNotification(null),
        refreshNotifications: fetchUnreadNotifs,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
