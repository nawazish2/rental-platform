import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const res = await api.get('/api/notifications/my');
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } catch {}
  };

  useEffect(() => { fetch(); const t = setInterval(fetch, 30000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/api/notifications/read-all');
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  const handleClick = async (n) => {
    if (!n.read) {
      await api.patch(`/api/notifications/${n._id}/read`);
      setNotifications((prev) => prev.map((x) => x._id === n._id ? { ...x, read: true } : x));
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const TYPE_ICON = { visit_update: '📅', ticket_reply: '💬', movein_update: '🏠', new_listing: '🏘️', payment: '💳' };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-1">🔔</p>
                <p className="text-xs text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button key={n._id} onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex gap-3 items-start ${!n.read ? 'bg-blue-50/50' : ''}`}>
                  <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] || '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-gray-800 ${!n.read ? 'text-blue-700' : ''}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-300 mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
