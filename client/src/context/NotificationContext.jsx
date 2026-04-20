import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({
  notifications: [],
  unread: 0,
  loading: false,
  refreshNotifications: async () => {},
  markAllRead: async () => {},
  markAsRead: async () => {},
});

const resolveSocketUrl = () => {
  const configured =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    window.location.origin;

  return configured.replace(/\/api\/?$/, '');
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnread(0);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/api/notifications/my');
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch (error) {
      setNotifications([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setNotifications([]);
      setUnread(0);
      setLoading(false);
      return;
    }

    refreshNotifications();

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const socket = io(resolveSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', refreshNotifications);
    socket.on('notification:new', ({ notification, unread: nextUnread }) => {
      setNotifications((current) => [notification, ...current].slice(0, 30));
      setUnread(typeof nextUnread === 'number' ? nextUnread : (count) => count + 1);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [refreshNotifications, user]);

  const markAsRead = useCallback(async (notificationId) => {
    const id = String(notificationId);
    await api.patch(`/api/notifications/${id}/read`);
    setNotifications((current) =>
      current.map((notification) =>
        String(notification._id) === id ? { ...notification, read: true } : notification
      )
    );
    setUnread((current) => Math.max(0, current - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.patch('/api/notifications/read-all');
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
    setUnread(0);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unread,
      loading,
      refreshNotifications,
      markAllRead,
      markAsRead,
    }),
    [loading, markAllRead, markAsRead, notifications, refreshNotifications, unread]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
