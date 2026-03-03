import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function MoveIn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [moveIn, setMoveIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1=Docs, 2=Agreement, 3=Inventory
  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [invItem, setInvItem] = useState({ item: '', condition: 'good', notes: '' });
  const [extForm, setExtForm] = useState({ requestedUntil: '', reason: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/movein/${id}`)
      .then((r) => setMoveIn(r.data.moveIn))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  const refresh = async () => {
    const r = await api.get(`/api/movein/${id}`);
    setMoveIn(r.data.moveIn);
  };

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docFile) { setError('Select a file'); return; }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      formData.append('name', docName || docFile.name);
      await api.post(`/api/movein/${id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('✅ Document uploaded!');
      setDocFile(null); setDocName('');
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
      setTimeout(() => { setMsg(''); setError(''); }, 3000);
    }
  };

  const handleAgreement = async () => {
    try {
      await api.put(`/api/movein/${id}/agreement`);
      setMsg('✅ Agreement confirmed!');
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
    setTimeout(() => { setMsg(''); setError(''); }, 3000);
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!invItem.item) { setError('Enter item name'); return; }
    try {
      await api.post(`/api/movein/${id}/inventory`, invItem);
      setInvItem({ item: '', condition: 'good', notes: '' });
      setMsg('✅ Item added!');
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
    setTimeout(() => { setMsg(''); setError(''); }, 3000);
  };

  const handleRemoveInventory = async (itemId) => {
    await api.delete(`/api/movein/${id}/inventory/${itemId}`);
    await refresh();
  };

  const handleExtensionRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/movein/${id}/extend`, extForm);
      setMsg('✅ Extension request submitted!');
      setExtForm({ requestedUntil: '', reason: '' });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
    setTimeout(() => { setMsg(''); setError(''); }, 3000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!moveIn) return null;

  const checklist = moveIn.checklist;
  const stepsConfig = [
    { num: 1, label: 'Documents', done: checklist.documents?.length > 0 },
    { num: 2, label: 'Agreement', done: checklist.agreementConfirmed },
    { num: 3, label: 'Inventory', done: checklist.inventoryList?.length > 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard')} className="text-blue-600 text-sm mb-4">← Back to Dashboard</button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Move-In Checklist</h1>
          <p className="text-gray-500 text-sm mt-1">{moveIn.property?.title}</p>
        </div>
        <StatusBadge status={moveIn.status} />
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {stepsConfig.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                step === s.num ? 'bg-blue-600 text-white' : s.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {s.done ? '✅' : `${s.num}.`} {s.label}
            </button>
            {i < stepsConfig.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{msg}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}

      {/* Step 1: Documents */}
      {step === 1 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">📄 Document Uploads</h2>
          <p className="text-sm text-gray-500 mb-4">Upload required documents: ID proof, address proof, employment proof, etc.</p>

          <form onSubmit={handleDocUpload} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Document name (e.g. Aadhar Card)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input type="file" onChange={(e) => setDocFile(e.target.files[0])} className="text-sm" accept=".pdf,.jpg,.jpeg,.png" />
            <button type="submit" disabled={uploadLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
              {uploadLoading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

          {checklist.documents?.length > 0 ? (
            <div className="space-y-2">
              {checklist.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600">📎</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No documents uploaded yet.</p>
          )}

          <button onClick={() => setStep(2)} className="mt-4 w-full border border-blue-300 text-blue-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-50">
            Next: Agreement →
          </button>
        </div>
      )}

      {/* Step 2: Agreement */}
      {step === 2 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">📜 Rental Agreement</h2>

          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-600 space-y-2">
            <p>By confirming the rental agreement, you acknowledge:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>You have read and agreed to all property rules</li>
              <li>You agree to pay rent on time every month</li>
              <li>You will maintain the property in good condition</li>
              <li>You will provide 30 days notice before vacating</li>
              <li>The security deposit terms have been discussed and agreed upon</li>
            </ul>
          </div>

          {checklist.agreementConfirmed ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-green-700">Agreement Confirmed</p>
                <p className="text-xs text-green-600">On {new Date(checklist.agreementConfirmedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          ) : (
            <button onClick={handleAgreement} className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700">
              ✅ I Confirm the Rental Agreement
            </button>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50">← Documents</button>
            <button onClick={() => setStep(3)} className="flex-1 border border-blue-300 text-blue-600 py-2 rounded-xl text-sm hover:bg-blue-50">Next: Inventory →</button>
          </div>
        </div>
      )}

      {/* Step 3: Inventory */}
      {step === 3 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">🛋️ Inventory List</h2>
          <p className="text-sm text-gray-500 mb-4">Record the condition of all items in the property.</p>

          <form onSubmit={handleAddInventory} className="grid sm:grid-cols-4 gap-2 mb-4">
            <input
              type="text"
              placeholder="Item (e.g. Sofa)"
              value={invItem.item}
              onChange={(e) => setInvItem({ ...invItem, item: e.target.value })}
              className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={invItem.condition}
              onChange={(e) => setInvItem({ ...invItem, condition: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700">Add</button>
          </form>

          {checklist.inventoryList?.length > 0 ? (
            <div className="space-y-2">
              {checklist.inventoryList.map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.item}</p>
                    {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.condition === 'good' ? 'bg-green-100 text-green-700' : item.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {item.condition}
                  </span>
                  <button onClick={() => handleRemoveInventory(item._id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No items added yet.</p>
          )}

          <button onClick={() => setStep(2)} className="mt-4 border border-gray-200 text-gray-600 py-2 px-4 rounded-xl text-sm hover:bg-gray-50">← Back</button>
        </div>
      )}

      {/* Extension Request */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="font-bold text-gray-900 text-lg mb-4">📅 Request Stay Extension</h2>
        <form onSubmit={handleExtensionRequest} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Extend Until</label>
            <input
              type="date" required
              value={extForm.requestedUntil}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setExtForm({ ...extForm, requestedUntil: e.target.value })}
              className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Reason</label>
            <textarea
              required
              value={extForm.reason}
              onChange={(e) => setExtForm({ ...extForm, reason: e.target.value })}
              placeholder="Please provide a reason for the extension..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-purple-700">
            Submit Extension Request
          </button>
        </form>

        {moveIn.extensionRequests?.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Previous Requests:</p>
            {moveIn.extensionRequests.map((r) => (
              <div key={r._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 text-sm text-gray-600">Until: {new Date(r.requestedUntil).toLocaleDateString('en-IN')}</div>
                <div className="flex-1 text-sm text-gray-500 line-clamp-1">{r.reason}</div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
