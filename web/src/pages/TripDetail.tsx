import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/travellite.png';

interface TripDetail {
  tripId: number;
  title: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalExpenses: number;
  budgetItems: BudgetItem[];
  places: Place[];
  checklistItems: ChecklistItem[];
  companions: Companion[];
}

interface BudgetItem {
  budgetId: number;
  category: string;
  amount: number;
}

interface Place {
  placeId: number;
  name: string;
}

interface ChecklistItem {
  itemId: number;
  name: string;
  isChecked: boolean;
}

interface Companion {
  companionId: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface WeatherData {
  destination: string;
  temperature: number;
  condition: string;
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    fetchTrip();
    fetchWeather();
    fetchProfile();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      setTrip(data);
      setChecklist(data.checklistItems || []);
    } catch (err) {
      console.error('Failed to fetch trip', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/trips/${id}/weather`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeather(res.data.data);
    } catch {
      setWeather(null);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      setUser((prev: any) => ({ ...prev, photo_url: data.photoUrl }));
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/v1/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete trip', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChecklistToggle = (itemId: number) => {
    setChecklist(prev =>
      prev.map(item => item.itemId === itemId ? { ...item, isChecked: !item.isChecked } : item)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  const getUserInitials = () =>
    `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${s.toLocaleDateString('en-US', options)} — ${e.toLocaleDateString('en-US', options)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#EF7722] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-[#EF7722] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-[#EF7722] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-gray-400 text-sm">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Trip not found.</p>
      </div>
    );
  }

  const packedCount = checklist.filter(i => i.isChecked).length;
  const packProgress = checklist.length > 0 ? Math.round((packedCount / checklist.length) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #eef0f4 0%, #e4e8ee 50%, #dde3eb 100%)' }}>

      {/* Navbar */}
      <div className="bg-[#1F2937] px-8 py-3 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <img src={logo} alt="TravelLite" className="h-10 w-10 object-contain drop-shadow-md" />
            <div>
            <p className="text-white font-bold text-lg leading-none tracking-tight">TravelLite</p>
            <p className="text-gray-400 text-xs tracking-wide">Trip Planning Dashboard</p>
          </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm font-medium">{user.first_name} {user.last_name}</span>
          <div className="rounded-full w-9 h-9 overflow-hidden shadow-md ring-2 ring-green-400 ring-opacity-30 flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#059669]">
            {user.photo_url ? (
              <img src={`http://localhost:8080${user.photo_url}`} alt="avatar" className="w-9 h-9 object-cover" />
            ) : (
              <span className="text-white text-sm font-bold">{getUserInitials()}</span>
            )}
          </div>
          <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10">
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

      <div className="px-8 py-8 max-w-[1400px] mx-auto">

        {/* Trip Header Card — premium with orange top bar */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 mb-5 overflow-hidden">
          {/* Orange accent top strip */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 60%, #0BA6DF 100%)' }} />
          <div className="p-6 flex justify-between items-start">
            <div className="flex-1">
              {/* Route pill */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Trip</span>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-xs text-gray-500 font-medium">{trip.origin}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs text-gray-500 font-medium">{trip.destination}</span>
                </div>
              </div>

              {/* Title + destination tag */}
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-black text-[#111827] tracking-tight">{trip.title}</h1>
                <span className="bg-gradient-to-r from-[#0BA6DF] to-[#0891c2] text-white font-bold px-3 py-1 rounded-lg text-xs shadow-md shadow-blue-100">
                  {trip.destination}
                </span>
              </div>

              {/* Date + duration */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">{formatDateRange(trip.startDate, trip.endDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#EF7722] bg-opacity-10 border border-orange-100 rounded-xl px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-[#EF7722]">{trip.duration} days</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 ml-6">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#0BA6DF] border-2 border-[#0BA6DF] hover:bg-blue-50 transition-all duration-200 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#EF4444] border-2 border-[#EF4444] hover:bg-red-50 transition-all duration-200 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Trip
              </button>
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <div className="mb-5">
          {weather ? (
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100/80 overflow-hidden">
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #EF7722, #f59340)' }} />
              <div className="px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="rounded-2xl p-3.5 shadow-lg shadow-orange-200/60" style={{ background: 'linear-gradient(135deg, #EF7722 0%, #f59340 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-[#111827] tracking-tight">{weather.temperature}°C</p>
                    <p className="text-gray-400 text-sm mt-0.5">{weather.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase mb-1">Destination Weather</p>
                  <span className="inline-block bg-gradient-to-r from-[#0BA6DF] to-[#0891c2] text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md shadow-blue-100">
                    {weather.destination}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/70 rounded-2xl border border-dashed border-gray-200 px-6 py-4 flex items-center gap-4">
              <div className="bg-gray-100 rounded-xl p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Weather information unavailable for this destination.</p>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-5 gap-5">

          {/* LEFT — Budget + Places */}
          <div className="col-span-3 flex flex-col gap-5">

            {/* Budget Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden">
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #EF7722, #f59340)' }} />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.1)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[#EF7722] font-black text-xs tracking-widest">BUDGET</p>
                </div>

                {trip.budgetItems && trip.budgetItems.length > 0 ? (
                  <>
                    <div className="space-y-1 mb-4">
                      {trip.budgetItems.map((item, index) => (
                        <div key={item.budgetId}>
                          <div className="flex justify-between items-center py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#EF7722] opacity-40 group-hover:opacity-100 transition-opacity" />
                              <span className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">{item.category}</span>
                            </div>
                            <span className="text-[#111827] font-bold text-sm tabular-nums">
                              ₱ {Number(item.amount).toLocaleString()}
                            </span>
                          </div>
                          {index < trip.budgetItems.length - 1 && <div className="border-b border-gray-50 mx-3" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center rounded-2xl px-5 py-4 border border-orange-100" style={{ background: 'linear-gradient(135deg, #fff8f3 0%, #fff4ec 100%)' }}>
                      <div>
                        <p className="text-xs text-orange-300 font-bold tracking-widest uppercase mb-0.5">Total Expenses</p>
                        <span className="text-[#EF7722] font-black text-2xl tabular-nums">
                          ₱ {Number(trip.totalExpenses).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.15)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(239,119,34,0.08)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">No budget items added.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Places Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden">
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #0BA6DF, #0891c2)' }} />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(11,166,223,0.1)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0BA6DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-[#0BA6DF] font-black text-xs tracking-widest">PLACES TO EXPLORE</p>
                  {trip.places && trip.places.length > 0 && (
                    <span className="ml-auto text-xs font-bold text-[#0BA6DF] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                      {trip.places.length} {trip.places.length === 1 ? 'place' : 'places'}
                    </span>
                  )}
                </div>

                {trip.places && trip.places.length > 0 ? (
                  <div className="space-y-2">
                    {trip.places.map((place, index) => (
                      <div key={place.placeId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-colors group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs text-[#0BA6DF] shadow-sm shadow-blue-100 group-hover:shadow-blue-200 transition-shadow" style={{ background: 'linear-gradient(135deg, rgba(11,166,223,0.15) 0%, rgba(8,145,194,0.15) 100%)', border: '1px solid rgba(11,166,223,0.2)' }}>
                          {index + 1}
                        </div>
                        <span className="text-gray-700 text-sm font-medium group-hover:text-[#111827] transition-colors flex-1">
                          {place.name}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-200 group-hover:text-[#0BA6DF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(11,166,223,0.08)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">No places added.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Companions + Checklist */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Companions Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden">
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #EF7722, #0BA6DF)' }} />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.1)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-[#EF7722] font-black text-xs tracking-widest">TRAVEL COMPANIONS</p>
                  {trip.companions && trip.companions.length > 0 && (
                    <span className="ml-auto text-xs font-bold text-[#EF7722] bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-lg">
                      {trip.companions.length}
                    </span>
                  )}
                </div>

                {trip.companions && trip.companions.length > 0 ? (
                  <div className="space-y-3">
                    {trip.companions.map(companion => (
                      <div key={companion.companionId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md shadow-blue-100" style={{ background: 'linear-gradient(135deg, #0BA6DF 0%, #0891c2 100%)' }}>
                          {getInitials(companion.firstName, companion.lastName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#111827] font-semibold text-sm truncate">{companion.firstName} {companion.lastName}</p>
                          <p className="text-gray-400 text-xs truncate">{companion.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(239,119,34,0.08)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">No companions added.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden">
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #EF7722, #f59340)' }} />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.1)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-[#EF7722] font-black text-xs tracking-widest">PACKING CHECKLIST</p>
                </div>

                {checklist.length > 0 && (
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400 font-medium">{packedCount} of {checklist.length} packed</span>
                      <span className="text-xs font-black text-[#EF7722]">{packProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${packProgress}%`, background: 'linear-gradient(90deg, #EF7722, #f59340)' }}
                      />
                    </div>
                  </div>
                )}

                {checklist && checklist.length > 0 ? (
                  <div className="space-y-1">
                    {checklist.map(item => (
                      <label key={item.itemId} className="flex items-center gap-3 cursor-pointer group py-2 px-2 rounded-xl hover:bg-gray-50 transition-all">
                        <div className="relative flex-shrink-0">
                          <input type="checkbox" checked={item.isChecked} onChange={() => handleChecklistToggle(item.itemId)} className="sr-only" />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${item.isChecked ? 'border-[#EF7722] shadow-sm shadow-orange-100' : 'border-gray-300 group-hover:border-[#EF7722]'}`} style={item.isChecked ? { background: 'linear-gradient(135deg, #EF7722, #f59340)' } : {}}>
                            {item.isChecked && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm transition-all ${item.isChecked ? 'line-through text-gray-300' : 'text-gray-700 group-hover:text-[#111827]'}`}>
                          {item.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(239,119,34,0.08)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">No checklist items added.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1 text-center">Delete Trip</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Are you sure you want to delete <span className="font-semibold text-[#111827]">"{trip.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-[#EF4444] text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50 shadow-md shadow-red-100"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditTripModal
          trip={trip}
          token={token || ''}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => { setShowEditModal(false); fetchTrip(); }}
        />
      )}
    </div>
  );
}

function EditTripModal({
  trip, token, onClose, onSuccess,
}: {
  trip: TripDetail; token: string; onClose: () => void; onSuccess: () => void;
}) {
  const [title, setTitle] = useState(trip.title);
  const [origin, setOrigin] = useState(trip.origin);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [budgetItems, setBudgetItems] = useState(
    trip.budgetItems.length > 0
      ? trip.budgetItems.map(b => ({ category: b.category, amount: String(b.amount) }))
      : [{ category: '', amount: '' }]
  );
  const [places, setPlaces] = useState(
    trip.places.length > 0 ? trip.places.map(p => ({ name: p.name })) : [{ name: '' }]
  );
  const [checklistItems, setChecklistItems] = useState(
    trip.checklistItems.length > 0 ? trip.checklistItems.map(c => ({ name: c.name })) : [{ name: '' }]
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalBudget = budgetItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

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
      await axios.put(
        `http://localhost:8080/api/v1/trips/${trip.tripId}`,
        {
          title, origin, destination, startDate, endDate,
          budgetItems: budgetItems.filter(b => b.category && b.amount),
          places: places.filter(p => p.name),
          checklistItems: checklistItems.filter(c => c.name),
          companions: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch {
      setError('Failed to update trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const darkInput = 'w-full bg-[#111827] border border-white/8 rounded-[10px] px-3 py-[11px] text-[#e5e7eb] text-[13.5px] placeholder-[#4b5563] outline-none focus:border-[#EF7722] transition-colors';
  const iconInput = 'w-full bg-[#111827] border border-white/8 rounded-[10px] pl-10 pr-3 py-[11px] text-[#e5e7eb] text-[13.5px] placeholder-[#4b5563] outline-none focus:border-[#EF7722] transition-colors';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl w-full max-w-2xl flex flex-col" style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '85vh' }}>
        <div className="flex-shrink-0 flex justify-between items-center px-6 py-[18px] rounded-t-2xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(11,166,223,0.15)' }}>
              <svg className="w-4 h-4 text-[#0BA6DF]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">Edit Trip</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-white text-xl font-bold transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-5 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <ModalSectionLabel>TRIP INFORMATION</ModalSectionLabel>
          <div className="mb-[10px]">
            <label className="block text-[11.5px] font-semibold text-[#9ca3af] tracking-wide mb-[5px]">Trip Title <span className="text-[#EF7722]">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </span>
              <input type="text" placeholder="e.g. Summer Beach Vacation" value={title} onChange={e => setTitle(e.target.value)} className={iconInput} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[10px] mb-[10px]">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">From <span className="text-[#EF7722]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
                <input type="text" placeholder="e.g. Manila" value={origin} onChange={e => setOrigin(e.target.value)} className={iconInput} />
              </div>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">Destination <span className="text-[#EF7722]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
                <input type="text" placeholder="e.g. Boracay" value={destination} onChange={e => setDestination(e.target.value)} className={iconInput} />
              </div>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">Start Date <span className="text-[#EF7722]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={iconInput} style={{ colorScheme: 'dark' }} />
              </div>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">End Date <span className="text-[#EF7722]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={iconInput} style={{ colorScheme: 'dark' }} />
              </div>
            </div>
          </div>

          <ModalDivider />
          <ModalSectionLabel>BUDGET</ModalSectionLabel>
          {budgetItems.map((item, index) => (
            <div key={index} className="grid grid-cols-2 gap-[10px] mb-[10px]">
              <input type="text" placeholder="Category (e.g. Food)" value={item.category} onChange={e => { const u = [...budgetItems]; u[index].category = e.target.value; setBudgetItems(u); }} className={darkInput} />
              <input type="number" placeholder="₱ Amount" value={item.amount} onChange={e => { const u = [...budgetItems]; u[index].amount = e.target.value; setBudgetItems(u); }} className={darkInput} style={{ colorScheme: 'dark' }} />
            </div>
          ))}
          <button onClick={() => setBudgetItems([...budgetItems, { category: '', amount: '' }])} className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors" style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>+ Add Category</button>
          <div className="flex justify-between items-center py-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[#9ca3af] text-sm">Total Budget</span>
            <span className="text-[#EF7722] text-base font-bold">₱{totalBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>

          <ModalDivider />
          <ModalSectionLabel>PLACES TO EXPLORE</ModalSectionLabel>
          {places.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: 'rgba(11,166,223,0.15)', color: '#0BA6DF' }}>{index + 1}</div>
              <input type="text" placeholder="Place name" value={item.name} onChange={e => { const u = [...places]; u[index].name = e.target.value; setPlaces(u); }} className={darkInput} />
            </div>
          ))}
          <button onClick={() => setPlaces([...places, { name: '' }])} className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors" style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>+ Add Place</button>

          <ModalDivider />
          <ModalSectionLabel>PACKING CHECKLIST</ModalSectionLabel>
          {checklistItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 rounded flex-shrink-0" style={{ border: '1.5px solid #EF7722', background: 'transparent' }} />
              <input type="text" placeholder="Item name" value={item.name} onChange={e => { const u = [...checklistItems]; u[index].name = e.target.value; setChecklistItems(u); }} className={darkInput} />
            </div>
          ))}
          <button onClick={() => setChecklistItems([...checklistItems, { name: '' }])} className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors" style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>+ Add Item</button>
          <div className="h-2" />
        </div>

        <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 rounded-b-2xl" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: '#1a2332' }}>
          <button onClick={onClose} className="px-6 py-[10px] rounded-[10px] text-[#9ca3af] text-[13.5px] font-medium transition-all" style={{ border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#e5e7eb'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#9ca3af'; }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-7 py-[10px] rounded-[10px] text-white text-[13.5px] font-bold transition-all disabled:opacity-50" style={{ background: '#EF7722' }} onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e06b18'; }} onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#EF7722'; }}>{loading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

function ModalSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-bold tracking-[0.1em]" style={{ color: '#EF7722' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

function ModalDivider() {
  return <hr className="my-5 border-none" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />;
}