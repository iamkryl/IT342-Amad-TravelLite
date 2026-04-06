import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/travellite.png';

interface DashboardData {
  totalTrips: number;
  overallExpense: number;
  upcomingTravelsCount: number;
}

interface Trip {
  tripId: number;
  title: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalExpenses: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const [dashboard, setDashboard] = useState<DashboardData>({
    totalTrips: 0,
    overallExpense: 0,
    upcomingTravelsCount: 0,
  });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchTrips();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(res.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/trips', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(res.data.data);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingTrips = async () => {
    setUpcomingLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/v1/trips/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingTrips(res.data.data);
    } catch (err) {
      console.error('Failed to fetch upcoming trips', err);
    } finally {
      setUpcomingLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const startMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = e.toLocaleDateString('en-US', { month: 'short' });
    const year = e.getFullYear();
    if (startMonth === endMonth && s.getFullYear() === e.getFullYear()) {
      return `${startMonth} ${s.getDate()}-${e.getDate()}, ${year}`;
    }
    return `${startMonth} ${s.getDate()} - ${endMonth} ${e.getDate()}, ${year}`;
  };

  const getInitials = () => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* Navbar */}
      <div className="bg-[#1F2937] px-8 py-3 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={logo} alt="TravelLite" className="h-10 w-10 object-contain drop-shadow-md" />
          <div>
            <p className="text-white font-bold text-lg leading-none tracking-tight">TravelLite</p>
            <p className="text-gray-400 text-xs tracking-wide">Trip Planning Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm font-medium">{user.first_name} {user.last_name}</span>
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full w-9 h-9 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-green-400 ring-opacity-30">
            {getInitials()}
          </div>
          <button className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400 hover:bg-opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-8 py-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] mb-1 tracking-tight">
              Welcome back, {user.first_name}! 👋
            </h1>
            <p className="text-gray-500">Manage your upcoming trips and track your travel budget</p>
          </div>
          <button
            onClick={() => setShowPlanModal(true)}
            className="bg-gradient-to-r from-[#EF7722] to-[#f59340] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:from-[#e06b18] hover:to-[#EF7722] transition-all duration-200 text-sm flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Plan New Trip
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          {/* Total Trips */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex justify-between items-center hover:shadow-lg transition-shadow duration-200">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Trips</p>
              <p className="text-4xl font-bold text-[#111827]">{dashboard.totalTrips}</p>
              <p className="text-gray-400 text-sm mt-1">Across all destinations</p>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#374151] rounded-2xl p-3.5 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>

          {/* Overall Expense */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex justify-between items-center hover:shadow-lg transition-shadow duration-200">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Overall Expense</p>
              <p className="text-4xl font-bold text-[#111827]">₱{dashboard.overallExpense.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-1">Total budget spent</p>
            </div>
            <div className="bg-gradient-to-br from-[#0BA6DF] to-[#0891c2] rounded-2xl p-3.5 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Upcoming Travels — clickable */}
          <div
            onClick={() => { setShowUpcomingModal(true); fetchUpcomingTrips(); }}
            className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-2xl p-6 shadow-md border border-blue-100 flex justify-between items-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div>
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">Upcoming Travels</p>
              <p className="text-4xl font-bold text-[#111827]">{dashboard.upcomingTravelsCount}</p>
              <p className="text-blue-400 text-sm mt-1">Trips coming up</p>
            </div>
            <div className="bg-gradient-to-br from-[#0BA6DF] to-[#0891c2] rounded-2xl p-3.5 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Trips Table */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-[#111827] tracking-tight">Your Recent Trips</h2>
            <span className="bg-orange-100 text-[#EF7722] text-xs font-bold px-2.5 py-1 rounded-full">
              {trips.length} trips
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-md border border-gray-100">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-[#EF7722] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#EF7722] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#EF7722] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-gray-400 text-sm mt-3">Loading your trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold mb-1">No trips yet</p>
              <p className="text-gray-400 text-sm">Start planning your first adventure!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1F2937] to-[#374151] text-white">
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Trip Title</th>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">From</th>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Destination</th>
                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {trips.map((trip, index) => (
                    <tr
                      key={trip.tripId}
                      onClick={() => navigate(`/trips/${trip.tripId}`)}
                      className={`cursor-pointer hover:bg-orange-50 transition-all duration-150 group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(trip.startDate, trip.endDate)}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#111827] group-hover:text-[#EF7722] transition-colors">
                          {trip.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-orange-50 text-[#EF7722] font-bold px-3 py-1.5 rounded-lg text-xs border border-orange-100">
                          ₱{Number(trip.totalExpenses).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{trip.origin}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-[#0BA6DF] font-bold px-3 py-1.5 rounded-lg text-xs border border-blue-100">
                          {trip.destination}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {trip.duration} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showPlanModal && (
        <PlanTripModal
          onClose={() => setShowPlanModal(false)}
          onSuccess={() => {
            setShowPlanModal(false);
            fetchDashboard();
            fetchTrips();
          }}
          token={token || ''}
        />
      )}

      {showUpcomingModal && (
        <UpcomingTripsModal
          onClose={() => setShowUpcomingModal(false)}
          trips={upcomingTrips}
          loading={upcomingLoading}
          onTripClick={(id) => navigate(`/trips/${id}`)}
        />
      )}
    </div>
  );
}

// ── Upcoming Trips Modal ──
function UpcomingTripsModal({
  onClose,
  trips,
  loading,
  onTripClick,
}: {
  onClose: () => void;
  trips: Trip[];
  loading: boolean;
  onTripClick: (id: number) => void;
}) {
  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const startMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = e.toLocaleDateString('en-US', { month: 'short' });
    const year = e.getFullYear();
    if (startMonth === endMonth && s.getFullYear() === e.getFullYear()) {
      return `${startMonth} ${s.getDate()}-${e.getDate()}, ${year}`;
    }
    return `${startMonth} ${s.getDate()} - ${endMonth} ${e.getDate()}, ${year}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
        style={{
          background: '#1a2332',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex justify-between items-center px-6 py-[18px] rounded-t-2xl"
          style={{
            background: '#1a2332',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(11,166,223,0.15)' }}
            >
              <svg className="w-4 h-4 text-[#0BA6DF]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-white font-semibold text-lg">Upcoming Travels</span>
              <p className="text-[#6b7280] text-xs">Your trips coming up</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-white text-xl font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <div className="w-2 h-2 bg-[#0BA6DF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#0BA6DF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#0BA6DF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-10">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(11,166,223,0.1)' }}
              >
                <svg className="w-7 h-7 text-[#0BA6DF]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white font-semibold mb-1">No upcoming trips</p>
              <p className="text-[#6b7280] text-sm">Plan a new trip to get started!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {trips.map((trip) => (
                <div
                  key={trip.tripId}
                  onClick={() => onTripClick(trip.tripId)}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,119,34,0.15)' }}
                  >
                    <svg className="w-5 h-5 text-[#EF7722]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{trip.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(11,166,223,0.15)', color: '#0BA6DF' }}
                      >
                        {trip.destination}
                      </span>
                      <span className="text-[#6b7280] text-[11px]">
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-[#9ca3af] text-xs">{trip.duration} days</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 px-6 py-4 rounded-b-2xl"
          style={{
            background: '#1a2332',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            onClick={onClose}
            className="w-full py-[10px] rounded-[10px] text-white text-[13.5px] font-bold transition-all"
            style={{ background: '#EF7722' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e06b18')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#EF7722')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Plan Trip Modal ──
function PlanTripModal({
  onClose,
  onSuccess,
  token,
}: {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const [title, setTitle] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetItems, setBudgetItems] = useState([{ category: '', amount: '' }]);
  const [places, setPlaces] = useState([{ name: '' }]);
  const [checklistItems, setChecklistItems] = useState([{ name: '' }]);
  const [companionEmail, setCompanionEmail] = useState('');
  const [companions, setCompanions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalBudget = budgetItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const handleCompanionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && companionEmail.trim()) {
      e.preventDefault();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(companionEmail.trim())) {
        setError('Please enter a valid companion email address.');
        return;
      }
      if (companions.includes(companionEmail.trim())) {
        setError('This email has already been added.');
        return;
      }
      setCompanions([...companions, companionEmail.trim()]);
      setCompanionEmail('');
      setError('');
    }
  };

  const removeCompanion = (email: string) => {
    setCompanions(companions.filter((c) => c !== email));
  };

  const handleSubmit = async () => {
    if (!title || !origin || !destination || !startDate || !endDate) {
      setError('All trip information fields are required.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(
        'http://localhost:8080/api/v1/trips',
        {
          title,
          origin,
          destination,
          startDate,
          endDate,
          budgetItems: budgetItems.filter((b) => b.category && b.amount),
          places: places.filter((p) => p.name),
          checklistItems: checklistItems.filter((c) => c.name),
          companions: companions.map((email) => ({ email })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      setError('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const darkInput =
    'w-full bg-[#111827] border border-white/8 rounded-[10px] px-3 py-[11px] text-[#e5e7eb] text-[13.5px] placeholder-[#4b5563] outline-none focus:border-[#EF7722] transition-colors';

  const iconInput =
    'w-full bg-[#111827] border border-white/8 rounded-[10px] pl-10 pr-3 py-[11px] text-[#e5e7eb] text-[13.5px] placeholder-[#4b5563] outline-none focus:border-[#EF7722] transition-colors';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: '#1a2332',
          border: '1px solid rgba(255,255,255,0.08)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex justify-between items-center px-6 py-[18px] rounded-t-2xl"
          style={{
            background: '#1a2332',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239,119,34,0.15)' }}
            >
              <svg className="w-4 h-4 text-[#EF7722]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">Plan New Trip</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-white text-xl font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-6 pb-2">

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 text-red-400 text-sm mb-5 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* TRIP INFORMATION */}
          <SectionLabel>TRIP INFORMATION</SectionLabel>

          <div className="field mb-[10px]">
            <label className="block text-[11.5px] font-semibold text-[#9ca3af] tracking-wide mb-[5px]">
              Trip Title <span className="text-[#EF7722]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="e.g. Summer Beach Vacation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={iconInput}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[10px]">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">
                From <span className="text-[#EF7722]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="e.g. Manila"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className={iconInput}
                />
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">
                Destination <span className="text-[#EF7722]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="e.g. Boracay"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={iconInput}
                />
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">
                Start Date <span className="text-[#EF7722]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={iconInput}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">
                End Date <span className="text-[#EF7722]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={iconInput}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
          </div>

          {/* BUDGET */}
          <Divider />
          <SectionLabel>BUDGET</SectionLabel>

          {budgetItems.map((item, index) => (
            <div key={index} className="grid grid-cols-2 gap-[10px] mb-[10px]">
              <input
                type="text"
                placeholder="Category (e.g. Food)"
                value={item.category}
                onChange={(e) => {
                  const u = [...budgetItems];
                  u[index].category = e.target.value;
                  setBudgetItems(u);
                }}
                className={darkInput}
              />
              <input
                type="number"
                placeholder="₱ Amount"
                value={item.amount}
                onChange={(e) => {
                  const u = [...budgetItems];
                  u[index].amount = e.target.value;
                  setBudgetItems(u);
                }}
                className={darkInput}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          ))}

          <button
            onClick={() => setBudgetItems([...budgetItems, { category: '', amount: '' }])}
            className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors"
            style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            + Add Category
          </button>

          <div
            className="flex justify-between items-center py-3 mt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-[#9ca3af] text-sm">Total Budget</span>
            <span className="text-[#EF7722] text-base font-bold">
              ₱{totalBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* PLACES TO EXPLORE */}
          <Divider />
          <SectionLabel>PLACES TO EXPLORE</SectionLabel>

          {places.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: 'rgba(11,166,223,0.15)', color: '#0BA6DF' }}
              >
                {index + 1}
              </div>
              <input
                type="text"
                placeholder="Place name"
                value={item.name}
                onChange={(e) => {
                  const u = [...places];
                  u[index].name = e.target.value;
                  setPlaces(u);
                }}
                className={darkInput}
              />
            </div>
          ))}

          <button
            onClick={() => setPlaces([...places, { name: '' }])}
            className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors"
            style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            + Add Place
          </button>

          {/* TRAVEL COMPANIONS */}
          <Divider />
          <SectionLabel>TRAVEL COMPANIONS</SectionLabel>

          <div
            className="flex flex-wrap items-center gap-2 min-h-[44px] rounded-[10px] px-3 py-2 cursor-text"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input');
              if (input) input.focus();
            }}
          >
            {companions.map((email) => (
              <span
                key={email}
                className="flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11.5px] font-semibold"
                style={{ background: 'rgba(11,166,223,0.15)', border: '1px solid rgba(11,166,223,0.3)', color: '#0BA6DF' }}
              >
                {email}
                <button
                  onClick={() => removeCompanion(email)}
                  className="text-[#60a5fa] text-sm leading-none ml-1 hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
            <div className="relative flex-1 flex items-center" style={{ minWidth: '160px' }}>
              <span className="absolute left-0 text-[#6b7280]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="Enter companion email and press Enter"
                value={companionEmail}
                onChange={(e) => setCompanionEmail(e.target.value)}
                onKeyDown={handleCompanionKeyDown}
                className="bg-transparent border-none outline-none text-[#e5e7eb] text-[13px] w-full"
                style={{ paddingLeft: '24px' }}
              />
            </div>
          </div>
          <p className="text-[#6b7280] text-[11.5px] mt-[6px] flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Companion must have an existing TravelLite account
          </p>

          {/* PACKING CHECKLIST */}
          <Divider />
          <SectionLabel>PACKING CHECKLIST</SectionLabel>

          {checklistItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded flex-shrink-0"
                style={{ border: '1.5px solid #EF7722', background: 'transparent' }}
              />
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => {
                  const u = [...checklistItems];
                  u[index].name = e.target.value;
                  setChecklistItems(u);
                }}
                className={darkInput}
              />
            </div>
          ))}

          <button
            onClick={() => setChecklistItems([...checklistItems, { name: '' }])}
            className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors"
            style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            + Add Item
          </button>

          <div className="h-6" />
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex justify-between items-center px-6 py-4 rounded-b-2xl"
          style={{ background: '#1a2332', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-[10px] rounded-[10px] text-[#9ca3af] text-[13.5px] font-medium transition-all"
            style={{ border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#e5e7eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#9ca3af'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-7 py-[10px] rounded-[10px] text-white text-[13.5px] font-bold transition-all disabled:opacity-50"
            style={{ background: '#EF7722' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#e06b18'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#EF7722'; }}
          >
            {loading ? 'Saving...' : 'Save Trip Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Small helpers ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-bold tracking-[0.1em]" style={{ color: '#EF7722' }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

function Divider() {
  return (
    <hr className="my-5 border-none" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
  );
}