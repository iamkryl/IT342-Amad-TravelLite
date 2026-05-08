import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';

interface AdminTrip {
  tripId: number;
  title: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  createdBy: string;
}

export default function TripManagement() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('token');
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    tripId: number;
    tripTitle: string;
  }>({ show: false, tripId: 0, tripTitle: '' });

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/admin/trips', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(res.data.data);
    } catch { navigate('/login'); }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/admin/trips/${confirmModal.tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmModal({ show: false, tripId: 0, tripTitle: '' });
      fetchTrips();
    } catch { alert('Failed to delete trip.'); }
  };

  const filteredTrips = trips.filter(t =>
    t.tripId.toString().includes(search) ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase()) ||
    t.origin.toLowerCase().includes(search.toLowerCase()) ||
    t.createdBy.toLowerCase().includes(search.toLowerCase()) ||
    t.startDate.includes(search) ||
    t.endDate.includes(search)
  );

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <h1 className="text-3xl font-black text-[#111827] mb-1 tracking-tight">Trip Management</h1>
        <p className="text-gray-500 text-sm mb-6">Monitor and manage all trips in the system</p>

        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(255,255,255,0.9)' }}>
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 60%, #0BA6DF 100%)' }} />

          {/* Table Header */}
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-base font-black text-[#111827] tracking-tight">All Trips</h2>
            <span className="bg-orange-50 text-[#EF7722] text-xs font-bold px-2.5 py-1 rounded-lg border border-orange-100">
              {filteredTrips.length} trips
            </span>
            {/* Search Box */}
            <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-72 focus-within:border-[#EF7722] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by ID, title, destination..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #1F2937 0%, #374151 100%)' }}>
                {['ID', 'Trip Title', 'Destination', 'From', 'Start Date', 'End Date', 'Created By', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-400 text-sm font-medium">No trips found for "<span className="text-[#EF7722]">{search}</span>"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip, index) => (
                  <tr key={trip.tripId} className={`transition-all duration-150 ${index % 2 === 0 ? 'bg-white hover:bg-orange-50' : 'bg-gray-50/30 hover:bg-orange-50'}`}>
                    <td className="px-6 py-4 text-gray-400 text-sm tabular-nums">{trip.tripId}</td>
                    <td className="px-6 py-4 font-bold text-[#111827]">{trip.title}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold px-3 py-1.5 rounded-lg text-xs border border-blue-100 text-[#0BA6DF]"
                        style={{ background: 'rgba(11,166,223,0.08)' }}>{trip.destination}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{trip.origin}</td>
                    <td className="px-6 py-4 text-gray-500">{trip.startDate}</td>
                    <td className="px-6 py-4 text-gray-500">{trip.endDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #0BA6DF 0%, #0891c2 100%)' }}>
                          {trip.createdBy.charAt(0)}
                        </div>
                        <span className="text-gray-600 text-sm">{trip.createdBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmModal({ show: true, tripId: trip.tripId, tripTitle: trip.title })}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 hover:-translate-y-0.5"
                        style={{ borderColor: '#EF4444', color: '#EF4444', background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6M14 11v6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1 text-center">Delete Trip</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Are you sure you want to permanently delete <span className="font-semibold text-[#111827]">"{confirmModal.tripTitle}"</span>?
              <span className="block text-red-400 text-xs mt-1">This action cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, tripId: 0, tripTitle: '' })}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all font-medium">
                Cancel
              </button>
              <button onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-[#EF4444] text-white rounded-xl text-sm font-bold transition-all shadow-md hover:-translate-y-0.5"
                style={{ boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}