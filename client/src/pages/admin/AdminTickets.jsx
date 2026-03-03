import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function AdminTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState(null);
  const [reply, setReply] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const r = await api.get('/api/support').finally(() => setLoading(false));
    setTickets(r.data.tickets);
  };

  const openTicket = async (id) => {
    const r = await api.get(`/api/support/${id}`);
    setThread(r.data.ticket);
    setSelected(id);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    await api.post(`/api/support/${selected}/message`, { text: reply });
    setReply('');
    await openTicket(selected);
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/api/support/${id}/status`, { status });
    setMsg('Status updated!');
    setTimeout(() => setMsg(''), 2000);
    await load();
    if (selected === id) await openTicket(id);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{msg}</div>}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto">
          {tickets.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No tickets yet.</p>
          ) : tickets.map((t) => (
            <button key={t._id} onClick={() => openTicket(t._id)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${selected === t._id ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-gray-900 text-sm line-clamp-1">{t.subject}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-xs text-gray-500">{t.raisedBy?.name} · {t.property?.title}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
            </button>
          ))}
        </div>

        {/* Thread */}
        <div className="lg:col-span-3">
          {thread ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-[560px]">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{thread.subject}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{thread.raisedBy?.name} ({thread.raisedBy?.email}) · {thread.property?.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={thread.status} />
                    <select value={thread.status} onChange={(e) => handleStatusChange(thread._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
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
              <form onSubmit={handleReply} className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text" value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply as admin..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">Reply</button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center h-[560px] text-gray-400 text-sm">
              Select a ticket to view conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
