import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, dispatch } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatar(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      if (avatar) fd.append('avatar', avatar);
      const res = await api.put('/api/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch({ type: 'SET_USER', payload: res.data.user });
      setMsg('Profile updated ✅');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving profile');
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your personal information</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {msg && <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium border ${msg.includes('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>{msg}</div>}

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative">
              {preview ? (
                <img src={preview} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100" alt="avatar" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-blue-100">
                  {initials}
                </div>
              )}
              <button type="button" onClick={() => fileRef.current.click()}
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-blue-700 shadow-md transition-colors">
                ✏️
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Full Name</label>
              <input value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
              <input value={user?.email} disabled
                className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Phone Number</label>
              <input value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))}
                placeholder="+91-XXXXXXXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Stats card */}
        <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Account Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div><span className="font-medium text-gray-700">Member since</span><br/>{new Date(user?.createdAt).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</div>
            <div><span className="font-medium text-gray-700">Role</span><br/><span className="capitalize">{user?.role}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
