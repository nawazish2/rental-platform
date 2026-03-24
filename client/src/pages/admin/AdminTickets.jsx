import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const CATEGORY_ICON = { maintenance: '🔧', billing: '💳', general: '💬', 'move-in': '🏠' };

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/api/support').then((r) => setTickets(r.data.tickets)).finally(() => setLoading(false));
  }, []);

  const openTicket = async (id) => {
    if (open?._id === id) return setOpen(null);
    const res = await api.get(`/api/support/${id}`);
    setOpen(res.data.ticket);
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/support/${open._id}/message`, { text: reply });
      setOpen((t) => ({
        ...t,
        messages: [...t.messages, { senderRole: 'admin', text: reply, createdAt: new Date() }],
      }));
      setReply('');
    } finally { setSending(false); }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/api/support/${id}/status`, { status });
    setTickets((prev) => prev.map((t) => t._id === id ? { ...t, status } : t));
    if (open?._id === id) setOpen((t) => ({ ...t, status }));
    setMsg(`Ticket marked as ${status}`);
    setTimeout(() => setMsg(''), 2000);
  };

  const counts = { all: tickets.length, open: 0, in_progress: 0, resolved: 0 };
  tickets.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });
  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Support Tickets</h1>
          <p className="text-gray-400 text-sm mt-0.5">{tickets.length} total tickets</p>

          <div className="flex gap-1 mt-5 flex-wrap">
            {[
              { key: 'all', icon: '📋', label: 'All' },
              { key: 'open', icon: '🔴', label: 'Open' },
              { key: 'in_progress', icon: '🟡', label: 'In Progress' },
              { key: 'resolved', icon: '🟢', label: 'Resolved' },
            ].map(({ key, icon, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${filter === key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                {icon} {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{counts[key] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {msg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">{msg}</div>}

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"/></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl block mb-2">🎫</span>
            <p className="text-gray-500 font-semibold">No tickets here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Ticket row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  onClick={() => openTicket(t._id)}>
                  <span className="text-2xl flex-shrink-0">{CATEGORY_ICON[t.category] || '💬'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-sm text-gray-800 line-clamp-1">{t.subject}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">👤 {t.raisedBy?.name}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{t.category}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">💬 {t.messages?.length || 0} replies</span>
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg flex-shrink-0">{open?._id === t._id ? '▲' : '▼'}</span>
                </div>

                {/* Expanded thread */}
                {open?._id === t._id && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-5">
                    {/* Messages */}
                    <div className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
                      {open.messages?.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No messages yet. Start the conversation.</p>}
                      {open.messages?.map((m, i) => (
                        <div key={i} className={`flex ${m.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                            m.senderRole === 'admin'
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                          }`}>
                            <p>{m.text}</p>
                            <p className={`text-xs mt-1 ${m.senderRole === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                              {m.senderRole === 'admin' ? '🛡️ Admin' : '👤 Tenant'} · {new Date(m.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply input */}
                    {t.status !== 'resolved' && (
                      <div className="flex gap-3">
                        <input value={reply} onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                          placeholder="Type a reply..."
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                        <button onClick={sendReply} disabled={sending || !reply.trim()}
                          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                          {sending ? '...' : 'Send'}
                        </button>
                      </div>
                    )}

                    {/* Status actions */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {t.status === 'open' && (
                        <button onClick={() => updateStatus(t._id,'in_progress')}
                          className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Mark In Progress
                        </button>
                      )}
                      {t.status !== 'resolved' && (
                        <button onClick={() => updateStatus(t._id,'resolved')}
                          className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Mark Resolved ✅
                        </button>
                      )}
                      {t.status === 'resolved' && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">✅ This ticket is resolved</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
