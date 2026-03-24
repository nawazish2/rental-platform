import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = ['maintenance','billing','general','move-in'];
const CATEGORY_ICON = { maintenance: '🔧', billing: '💳', general: '💬', 'move-in': '🏠' };

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ subject: '', category: 'general', message: '' });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const msgEndRef = useRef(null);

  useEffect(() => {
    api.get('/api/support/my').then((r) => setTickets(r.data.tickets)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open?.messages]);

  const openTicket = async (id) => {
    if (open?._id === id) return setOpen(null);
    const res = await api.get(`/api/support/${id}`);
    setOpen(res.data.ticket);
  };

  const sendReply = async () => {
    if (!reply.trim() || !open) return;
    setSending(true);
    try {
      await api.post(`/api/support/${open._id}/message`, { text: reply });
      setOpen((t) => ({
        ...t,
        messages: [...t.messages, { senderRole: 'tenant', text: reply, createdAt: new Date() }],
      }));
      setReply('');
    } finally { setSending(false); }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!newForm.subject.trim() || !newForm.message.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/api/support', {
        subject: newForm.subject,
        category: newForm.category,
        initialMessage: newForm.message,
      });
      setTickets((prev) => [res.data.ticket, ...prev]);
      setNewForm({ subject: '', category: 'general', message: '' });
      setShowNew(false);
      setMsg('Ticket created ✅ Our team will respond shortly.');
      setTimeout(() => setMsg(''), 3000);
    } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Support Tickets</h1>
              <p className="text-gray-400 text-sm mt-0.5">Get help from our support team</p>
            </div>
            <button onClick={() => setShowNew((p) => !p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${showNew ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {showNew ? '✕ Cancel' : '+ New Ticket'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">{msg}</div>}

        {/* New ticket form */}
        {showNew && (
          <form onSubmit={createTicket} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">🎫 Create New Ticket</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Subject</label>
                <input value={newForm.subject} onChange={(e) => setNewForm((f) => ({ ...f, subject: e.target.value }))}
                  required placeholder="Briefly describe the issue..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Category</label>
                <select value={newForm.category} onChange={(e) => setNewForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_ICON[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Message</label>
              <textarea value={newForm.message} onChange={(e) => setNewForm((f) => ({ ...f, message: e.target.value }))}
                required rows={4} placeholder="Describe your issue in detail..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <button type="submit" disabled={creating}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {creating ? 'Creating...' : 'Submit Ticket'}
            </button>
          </form>
        )}

        {/* Ticket list */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"/></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <span className="text-5xl block mb-3">🎫</span>
            <h3 className="font-bold text-gray-700 mb-2">No tickets yet</h3>
            <p className="text-sm text-gray-400 mb-5">Need help? Create your first support ticket.</p>
            <button onClick={() => setShowNew(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
              Create Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  onClick={() => openTicket(t._id)}>
                  <span className="text-2xl flex-shrink-0">{CATEGORY_ICON[t.category] || '💬'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-sm text-gray-800 line-clamp-1">{t.subject}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{t.category}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">💬 {t.messages?.length || 0} messages</span>
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg flex-shrink-0">{open?._id === t._id ? '▲' : '▼'}</span>
                </div>

                {/* Thread */}
                {open?._id === t._id && (
                  <div className="border-t border-gray-100 bg-gray-50/40 px-5 py-5">
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
                      {open.messages?.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No messages yet</p>}
                      {open.messages?.map((m, i) => (
                        <div key={i} className={`flex ${m.senderRole === 'tenant' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                            m.senderRole === 'tenant'
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                          }`}>
                            <p>{m.text}</p>
                            <p className={`text-xs mt-1 ${m.senderRole === 'tenant' ? 'text-blue-200' : 'text-gray-400'}`}>
                              {m.senderRole === 'tenant' ? 'You' : '🛡️ Support'} · {new Date(m.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={msgEndRef} />
                    </div>

                    {t.status !== 'resolved' ? (
                      <div className="flex gap-3">
                        <input value={reply} onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendReply()}
                          placeholder="Type a message..."
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                        <button onClick={sendReply} disabled={sending || !reply.trim()}
                          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                          {sending ? '...' : 'Send'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">✅ This ticket has been resolved</p>
                    )}
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
