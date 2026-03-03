import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function SupportTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [thread, setThread] = useState(null);
  const [reply, setReply] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [properties, setProperties] = useState([]);
  const [newTicket, setNewTicket] = useState({ propertyId: '', subject: '', category: 'general', message: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadTickets();
    api.get('/api/properties').then((r) => setProperties(r.data.properties)).catch(() => {});
  }, []);

  const loadTickets = async () => {
    const r = await api.get('/api/support/my').finally(() => setLoading(false));
    setTickets(r.data.tickets);
  };

  const openTicket = async (id) => {
    const r = await api.get(`/api/support/${id}`);
    setThread(r.data.ticket);
    setSelectedTicket(id);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    await api.post(`/api/support/${selectedTicket}/message`, { text: reply });
    setReply('');
    await openTicket(selectedTicket);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/support', newTicket);
      setMsg('✅ Ticket created!');
      setNewTicket({ propertyId: '', subject: '', category: 'general', message: '' });
      setShowCreate(false);
      await loadTickets();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'));
    }
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          + New Ticket
        </button>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{msg}</div>}

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900">New Support Ticket</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Property</label>
                <select required value={newTicket.propertyId} onChange={(e) => setNewTicket({ ...newTicket, propertyId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select property</option>
                  {properties.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Category</label>
                <select value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="billing">Billing</option>
                  <option value="move-in">Move-In</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Subject</label>
                <input required type="text" value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief subject of the issue"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Message</label>
                <textarea required rows={4} value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-2">🎫</span>
              <p>No tickets yet. Create one if you have an issue.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <button key={t._id} onClick={() => openTicket(t._id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedTicket === t._id ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-gray-900 text-sm line-clamp-1">{t.subject}</p>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-xs text-gray-500">{t.property?.title}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
              </button>
            ))
          )}
        </div>

        {/* Thread View */}
        <div className="lg:col-span-3">
          {thread ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-[500px]">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">{thread.subject}</h3>
                  <StatusBadge status={thread.status} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{thread.property?.title} · {thread.category}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {thread.messages?.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.senderRole === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${m.senderRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {m.senderRole === 'admin' ? 'A' : 'T'}
                    </div>
                    <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.senderRole === 'admin' ? 'bg-purple-50 text-gray-700' : 'bg-blue-50 text-gray-700'}`}>
                      <p>{m.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
              {thread.status !== 'resolved' && (
                <form onSubmit={handleReply} className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text" value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Send</button>
                </form>
              )}
              {thread.status === 'resolved' && (
                <p className="text-center text-xs text-gray-400 p-3 border-t">This ticket has been resolved.</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center h-[500px] text-gray-400 text-sm">
              Select a ticket to view the conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
