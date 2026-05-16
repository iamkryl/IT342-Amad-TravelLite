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

  // Top destinations count
  const destinationCount: Record<string, number> = {};
  trips.forEach(t => {
    const dest = t.destination.split(',')[0].trim();
    destinationCount[dest] = (destinationCount[dest] || 0) + 1;
  });
  const topDest = Object.entries(destinationCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;
  const totalPages = Math.ceil(filteredTrips.length / rowsPerPage);
  const paginatedTrips = filteredTrips.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <h1 className="text-3xl font-black text-[#111827] mb-1 tracking-tight">Trip Management</h1>
        <p className="text-gray-500 text-sm mb-6">Monitor and manage all trips in the system</p>

        {/* ── Summary Badges ── */}
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#EF7722]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Trips</span>
            <span className="text-sm font-black text-[#111827]">{trips.length}</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#0BA6DF]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Top Destination</span>
            <span className="text-sm font-black text-[#111827]">{topDest}</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Unique Destinations</span>
            <span className="text-sm font-black text-[#111827]">{Object.keys(destinationCount).length}</span>
          </div>
        </div>

        {/* ── Main Table Card ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden transition-all duration-300"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(255,255,255,0.9)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(239,119,34,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
        >
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
            <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-72 focus-within:border-[#EF7722] focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by ID, title, destination..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead style={{ display: 'block' }}>
              <tr style={{ background: 'linear-gradient(90deg, #1F2937 0%, #374151 100%)', display: 'table', width: '100%', tableLayout: 'fixed' }}>
                {['ID', 'Trip Title', 'Destination', 'From', 'Start Date', 'End Date', 'Created By', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50" style={{ display: 'block', minHeight: '855px' }}>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.08)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-semibold">No trips found</p>
                        <p className="text-gray-400 text-xs mt-0.5">No results for "<span className="text-[#EF7722] font-bold">{search}</span>"</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                {paginatedTrips.map((trip, index) => (
                  <tr
                    key={trip.tripId}
                    className="transition-all duration-200 group/row"
                    style={{ background: index % 2 === 0 ? 'white' : 'rgba(249,250,251,0.5)', height: '57px', display: 'table', width: '100%', tableLayout: 'fixed' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(239,119,34,0.03)';
                      (e.currentTarget as HTMLTableRowElement).style.boxShadow = 'inset 3px 0 0 #EF7722';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLTableRowElement).style.background = index % 2 === 0 ? 'white' : 'rgba(249,250,251,0.5)';
                      (e.currentTarget as HTMLTableRowElement).style.boxShadow = 'none';
                    }}
                  >
                    <td className="px-6 py-4 text-gray-400 text-sm tabular-nums font-medium">{trip.tripId}</td>
                    <td className="px-6 py-4 font-bold text-[#111827] transition-colors duration-200 group-hover/row:text-[#EF7722]">
                      {trip.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100 text-[#0BA6DF] transition-all duration-200 group-hover/row:bg-blue-100"
                        style={{ background: 'rgba(11,166,223,0.08)' }}
                      >
                        {trip.destination}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{trip.origin}</td>
                    <td className="px-6 py-4 text-gray-500">{trip.startDate}</td>
                    <td className="px-6 py-4 text-gray-500">{trip.endDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-all duration-200 group-hover/row:scale-110 group-hover/row:rotate-3"
                          style={{ background: 'linear-gradient(135deg, #EF7722 0%, #f59340 100%)', boxShadow: '0 2px 8px rgba(239,119,34,0.3)' }}
                        >
                          {trip.createdBy.charAt(0)}
                        </div>
                        <span className="text-gray-600 text-sm">{trip.createdBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/trips/${trip.tripId}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 hover:-translate-y-0.5"
                      style={{ borderColor: '#0BA6DF', color: '#0BA6DF', background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#0BA6DF'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,166,223,0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0BA6DF'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => setConfirmModal({ show: true, tripId: trip.tripId, tripTitle: trip.title })}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 hover:-translate-y-0.5"
                      style={{ borderColor: '#EF4444', color: '#EF4444', background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.35)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
                  </tr>
                ))}
                {Array.from({ length: rowsPerPage - paginatedTrips.length }).map((_, i) => (
                  <tr key={`empty-${i}`} style={{ height: '57px', background: i % 2 === 0 ? 'white' : 'rgba(249,250,251,0.5)', display: 'table', width: '100%', tableLayout: 'fixed' }}>
                    <td colSpan={8} />
                  </tr>
                ))}
                </>
              )}
            </tbody>
          </table>

          {/* ── Footer ── */}
          {filteredTrips.length > 0 && (
            <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6', background: '#FAFAFA' }}>
              <p className="text-xs text-gray-400">
                Showing <span className="font-bold text-gray-600">{Math.min(currentPage * rowsPerPage, filteredTrips.length)}</span> of <span className="font-bold text-gray-600">{filteredTrips.length}</span> trips
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                <span className="text-xs text-gray-500 font-medium">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Delete Modal ── */}
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
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-[#111827]">"{confirmModal.tripTitle}"</span>?
              <span className="block text-red-400 text-xs mt-1">This action cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, tripId: 0, tripTitle: '' })}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{ background: '#EF4444', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(239,68,68,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(239,68,68,0.4)'; }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}