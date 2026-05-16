import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/travellite.png';

interface TripDetail {
  tripId: number;
  title: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalExpenses: number;
  createdBy: number;
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

/* ─── Weather condition → icon helper ─── */
function WeatherIcon({ condition }: { condition: string }) {
  const c = condition?.toLowerCase() || '';

  if (c.includes('thunder') || c.includes('storm')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10l-3 5h4l-3 5" />
      </svg>
    );
  }
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 19v2M12 19v2M16 19v2" />
      </svg>
    );
  }
  if (c.includes('snow') || c.includes('sleet') || c.includes('ice')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
      </svg>
    );
  }
  if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog') || c.includes('haze')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    );
  }
  /* default: sunny */
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white relative z-10 group-hover:rotate-45 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="4" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

/* ─── Weather card background gradient by condition ─── */
function getWeatherGradient(condition: string) {
  const c = condition?.toLowerCase() || '';
  if (c.includes('thunder') || c.includes('storm')) return 'from-[#374151] to-[#4B5563]';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'from-[#2563EB] to-[#0BA6DF]';
  if (c.includes('snow') || c.includes('sleet')) return 'from-[#93C5FD] to-[#BFDBFE]';
  if (c.includes('cloud') || c.includes('overcast') || c.includes('mist') || c.includes('fog')) return 'from-[#6B7280] to-[#9CA3AF]';
  return 'from-[#EF7722] to-[#f59340]'; // sunny
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Reactive user state — re-reads localStorage whenever Profile page saves.
  // Profile page must call: window.dispatchEvent(new Event('userUpdated'))
  // after writing updated user to localStorage.
  const readUser = () => JSON.parse(localStorage.getItem('user') || '{}');
  const [user, setUser] = useState(readUser);

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

  // Re-sync user from localStorage on profile updates (same tab or cross-tab)
  useEffect(() => {
    const sync = () => setUser(readUser());
    window.addEventListener('userUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('userUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      setUser((prev: any) => ({
        ...prev,
        id: data.userId,
        photo_url: data.photoUrl,
        first_name: data.firstName,
        last_name: data.lastName,
      }));
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

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

  const handleChecklistToggle = async (itemId: number) => {
    const item = checklist.find(i => i.itemId === itemId);
    if (!item) return;
    const newValue = !item.isChecked;
    setChecklist(prev =>
      prev.map(i => i.itemId === itemId ? { ...i, isChecked: newValue } : i)
    );
    try {
      await axios.patch(
        `http://localhost:8080/api/v1/trips/${id}/checklist/${itemId}`,
        { isChecked: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update checklist item', err);
      setChecklist(prev =>
        prev.map(i => i.itemId === itemId ? { ...i, isChecked: !newValue } : i)
      );
    }
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
    return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}`;
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
    navigate('/dashboard');
    return null;  
  }

  const isOwner = Number(user.id) === Number(trip.createdBy);
  const isCompanion = !isOwner;
  const weatherGradient = weather ? getWeatherGradient(weather.condition) : 'from-[#EF7722] to-[#f59340]';


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
              <img src={user.photo_url} alt="avatar" className="w-9 h-9 object-cover" />
            ) : (
              <span className="text-white text-sm font-bold">{getUserInitials()}</span>
            )}
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="text-gray-400 hover:text-white transition-all duration-200 p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 hover:scale-110"
            title="Profile Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-400 hover:bg-opacity-10 hover:scale-110"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl mx-auto">

        {/* Companion view-only banner */}
        {isCompanion && (
          <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderLeft: '4px solid #0BA6DF', boxShadow: '0 4px 15px rgba(11,166,223,0.12)' }}>
            <div className="w-8 h-8 rounded-lg bg-[#0BA6DF]/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0BA6DF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[#0BA6DF] font-bold text-sm">You're invited to this trip</p>
              <p className="text-blue-400 text-xs">You can view all trip details but cannot make any changes.</p>
            </div>
          </div>
        )}

        {/* Trip Header Card */}
        <div className="bg-white rounded-2xl overflow-hidden mb-5 hover:-translate-y-1 transition-all duration-300" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset', border: '1px solid rgba(255,255,255,0.9)' }}>
          <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 40%, #0BA6DF 100%)' }} />
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-[#111827] tracking-tight">{trip.title}</h1>
                  <span className="bg-blue-50 text-[#0BA6DF] font-bold px-3 py-1 rounded-lg text-sm border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                    {trip.destination}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  From <span className="font-medium text-gray-700">{trip.origin}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-gray-700">{trip.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                    <path strokeLinecap="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {formatDateRange(trip.startDate, trip.endDate)}
                  <span className="text-gray-300">•</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-semibold">{trip.duration} days</span>
                </div>
              </div>

              {/* Owner: show Edit + Delete. Companion: show View Only badge. */}
              {isOwner ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="border-2 border-[#0BA6DF] text-[#0BA6DF] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#0BA6DF] hover:text-white transition-all duration-200 flex items-center gap-2 hover:shadow-md hover:shadow-blue-100 hover:-translate-y-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414A2 2 0 019.586 13z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-2 border-[#EF4444] text-[#EF4444] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#EF4444] hover:text-white transition-all duration-200 flex items-center gap-2 hover:shadow-md hover:shadow-red-100 hover:-translate-y-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6M14 11v6" />
                    </svg>
                    Delete Trip
                  </button>
                </div>
              ) : (
                <span className="flex items-center gap-1.5 bg-blue-50 text-[#0BA6DF] border border-blue-100 text-xs font-bold px-3 py-1.5 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Only
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <div className="bg-white rounded-2xl overflow-hidden mb-5 group hover:shadow-2xl hover:shadow-gray-200/80 hover:-translate-y-0.5 transition-all duration-300">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #0BA6DF 100%)' }} />
          <div className="p-5">
            {weather ? (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* Animated weather icon */}
                  <div className={`relative bg-gradient-to-br ${weatherGradient} rounded-2xl p-3 shadow-md group-hover:shadow-lg transition-all duration-300 overflow-hidden`}>
                    <span className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <WeatherIcon condition={weather.condition} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#111827] tabular-nums">{weather.temperature}°C</p>
                    <p className="text-gray-400 text-sm capitalize">{weather.condition}</p>
                  </div>
                </div>
                {/* Destination label + badge */}
                <div className="flex flex-col items-end gap-1.5">
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Destination Weather</p>
                  <span className="bg-gradient-to-r from-[#0BA6DF] to-[#0891c2] text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md shadow-blue-100 group-hover:shadow-blue-200 group-hover:from-[#0891c2] group-hover:to-[#0369a1] transition-all duration-300 cursor-default">
                    {weather.destination}
                  </span>
                </div>
              </div>
            ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-[#374151] to-[#4B5563] rounded-2xl p-3 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold text-sm">Weather unavailable</p>
                  <p className="text-gray-400 text-xs mt-0.5">Could not fetch weather for <span className="text-[#0BA6DF] font-medium">{trip.destination}</span></p>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 font-medium">
                Try again later
              </span>
            </div>
          )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-5 gap-5">

          {/* LEFT — Budget + Places */}
          <div className="col-span-3 flex flex-col gap-5">

            {/* Budget Card */}
            <div className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-gray-200/80 hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 100%)' }} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.1)' }}>
                    {/* Coin / peso icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h4a2 2 0 010 4H9v4M9 12h6" />
                    </svg>
                  </div>
                  <p className="text-[#EF7722] font-bold text-xs tracking-widest">BUDGET</p>
                </div>
                {trip.budgetItems && trip.budgetItems.length > 0 ? (
                  <>
                    <div className="space-y-1">
                      {trip.budgetItems.map((item, index) => (
                        <div key={item.budgetId}>
                          <div className="flex justify-between items-center py-3 group/row px-2 rounded-lg hover:bg-orange-50/60 transition-colors duration-150">
                            <span className="text-gray-600 text-sm group-hover/row:text-gray-800 transition-colors">{item.category}</span>
                            <span className="text-[#111827] font-semibold text-sm tabular-nums group-hover/row:text-[#EF7722] transition-colors duration-150">
                              ₱ {Number(item.amount).toLocaleString()}
                            </span>
                          </div>
                          {index < trip.budgetItems.length - 1 && <div className="border-b border-gray-50" />}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between items-center bg-orange-50 rounded-xl px-4 py-3 border border-orange-100 hover:bg-orange-100/60 transition-colors duration-200">
                      <span className="text-gray-700 font-bold text-sm">Total Expenses</span>
                      <span className="text-[#EF7722] font-bold text-xl tabular-nums">
                        ₱ {Number(trip.totalExpenses).toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-300 text-sm text-center py-6">No budget items added.</p>
                )}
              </div>
            </div>

            {/* Places Card */}
            <div  className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hiddenhover:shadow-2xl hover:shadow-gray-200/80 hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0BA6DF 0%, #0891c2 100%)' }} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(11,166,223,0.1)' }}>
                    {/* Map pin filled */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0BA6DF]" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.698-5.142 3.698-8.827a8 8 0 10-16 0c0 3.685 1.754 6.748 3.699 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-[#EF7722] font-bold text-xs tracking-widest">PLACES TO EXPLORE</p>
                </div>
                {trip.places && trip.places.length > 0 ? (
                  <div className="space-y-3">
                    {trip.places.map((place, index) => (
                      <div key={place.placeId} className="flex items-center gap-3 group/place">
                        <div className="bg-gradient-to-br from-[#0BA6DF] to-[#0891c2] rounded-xl w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-100 group-hover/place:shadow-md group-hover/place:shadow-blue-200 group-hover/place:scale-110 transition-all duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.698-5.142 3.698-8.827a8 8 0 10-16 0c0 3.685 1.754 6.748 3.699 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm font-medium group-hover/place:text-[#0BA6DF] transition-colors duration-200">
                          {index + 1}. {place.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm text-center py-6">No places added.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Companions + Checklist */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Companions Card */}
            <div className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-gray-200/80 hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0BA6DF 0%, #0891c2 100%)' }} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(11,166,223,0.1)' }}>
                    {/* People group icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0BA6DF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <p className="text-[#EF7722] font-bold text-xs tracking-widest">TRAVEL COMPANIONS</p>
                </div>
                {trip.companions && trip.companions.length > 0 ? (
                  <div className="space-y-4">
                    {trip.companions.map(companion => (
                      <div key={companion.companionId} className="flex items-center gap-3 group/comp">
                        <div className="rounded-xl w-10 h-10 flex items-center justify-center text-white text-sm font-black flex-shrink-0 transition-all duration-200 group-hover/comp:scale-105" style={{ background: 'linear-gradient(135deg, #0BA6DF 0%, #0369a1 100%)', boxShadow: '0 4px 12px rgba(11,166,223,0.35)' }}>
                          {getInitials(companion.firstName, companion.lastName)}
                        </div>
                        <div>
                          <p className="text-[#111827] font-semibold text-sm group-hover/comp:text-[#0BA6DF] transition-colors duration-200">{companion.firstName} {companion.lastName}</p>
                          <p className="text-gray-400 text-xs">{companion.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">No companions added.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist Card */}
            <div className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-gray-200/80 hover:-translate-y-0.5 transition-all duration-300">
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 100%)' }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.1)' }}>
                      {/* Clipboard check icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-[#EF7722] font-bold text-xs tracking-widest">PACKING CHECKLIST</p>
                  </div>
                  {checklist.length > 0 && (
                    isOwner ? (
                      <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        {checklist.filter(i => i.isChecked).length}/{checklist.length} packed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        View only
                      </span>
                    )
                  )}
                </div>
                {checklist && checklist.length > 0 ? (
                  <div className="space-y-1">
                    {checklist.map(item => (
                      <label
                        key={item.itemId}
                        className={`flex items-center gap-3 py-1.5 px-2 rounded-xl transition-all duration-150 ${isOwner ? 'cursor-pointer hover:bg-orange-50/70' : 'cursor-default'}`}
                      >
                        <div className="relative flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            onChange={() => isOwner && handleChecklistToggle(item.itemId)}
                            disabled={!isOwner}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                            item.isChecked
                              ? 'bg-[#EF7722] border-[#EF7722] shadow-sm shadow-orange-200'
                              : isOwner
                              ? 'border-gray-300'
                              : 'border-gray-200 bg-gray-50'
                          }`}>
                            {item.isChecked && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm transition-all duration-200 ${
                          item.isChecked
                            ? 'line-through text-gray-300'
                            : 'text-gray-700 group-hover/check:text-[#111827]'
                        }`}>
                          {item.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm text-center py-6">No checklist items added.</p>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6M14 11v6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1 text-center">Delete Trip</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Are you sure you want to delete <span className="font-semibold text-[#111827]">"{trip.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-[#EF4444] text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all duration-200 disabled:opacity-50 shadow-md shadow-red-100 hover:shadow-red-200 hover:-translate-y-0.5"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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

/* ─────────────────────────────────────────────────
   Edit Trip Modal
───────────────────────────────────────────────── */
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
  const [companionEmail, setCompanionEmail] = useState('');
  const [companions, setCompanions] = useState<string[]>(trip.companions.map(c => c.email));

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
    const filledBudget = budgetItems.filter(b => b.category || b.amount);
    const invalidBudget = filledBudget.some(
      b => !b.category || !b.amount || parseFloat(b.amount) <= 0
    );
    if (invalidBudget) {
      setError('Each budget item must have a category and an amount greater than 0.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.put(
        `http://localhost:8080/api/v1/trips/${trip.tripId}`,
        {
          title, origin, destination, startDate, endDate,
          budgetItems: budgetItems.filter(b => b.category && b.amount && parseFloat(b.amount) > 0),
          places: places.filter(p => p.name),
          checklistItems: checklistItems.filter(c => c.name),
          companions: companions.map(email => ({ email })),
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
      <div
        className="rounded-2xl w-full max-w-2xl flex flex-col"
        style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '92vh' }}
      >
        {/* Modal Header */}
        <div
          className="flex-shrink-0 flex justify-between items-center px-6 py-[18px] rounded-t-2xl"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(11,166,223,0.15)' }}>
              <svg className="w-4 h-4 text-[#0BA6DF]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414A2 2 0 019.586 13z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">Edit Trip</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-white text-xl font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="flex-1 overflow-y-auto px-6 pt-5 pb-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
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

          <ModalSectionLabel>TRIP INFORMATION</ModalSectionLabel>
          <div className="mb-[10px]">
            <label className="block text-[11.5px] font-semibold text-[#9ca3af] tracking-wide mb-[5px]">
              Trip Title <span className="text-[#EF7722]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </span>
              <input type="text" placeholder="e.g. Summer Beach Vacation" value={title} onChange={e => setTitle(e.target.value)} className={iconInput} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[10px] mb-[10px]">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">From <span className="text-[#EF7722]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <input type="text" placeholder="e.g. Manila" value={origin} onChange={e => setOrigin(e.target.value)} className={iconInput} />
              </div>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">Destination <span className="text-[#EF7722]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 16 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <input type="text" placeholder="e.g. Boracay" value={destination} onChange={e => setDestination(e.target.value)} className={iconInput} />
              </div>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">Start Date <span className="text-[#EF7722]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={iconInput} style={{ colorScheme: 'dark' }} />
              </div>
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11.5px] font-semibold text-[#9ca3af] tracking-wide">End Date <span className="text-[#EF7722]">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={iconInput} style={{ colorScheme: 'dark' }} />
              </div>
            </div>
          </div>

          <ModalDivider />
          <ModalSectionLabel>BUDGET</ModalSectionLabel>
          {budgetItems.map((item, index) => (
          <div key={index} className="grid grid-cols-2 gap-[10px] mb-[10px]">
            <input type="text" placeholder="Category (e.g. Food)" value={item.category}
              onChange={e => { const u = [...budgetItems]; u[index].category = e.target.value; setBudgetItems(u); }}
              className={darkInput} />
            <div className="flex gap-2">
              <input type="number" placeholder="₱ Amount" value={item.amount}
                onChange={e => { const u = [...budgetItems]; u[index].amount = e.target.value; setBudgetItems(u); }}
                className={darkInput} style={{ colorScheme: 'dark' }} />
              {budgetItems.length > 1 && (
                <button onClick={() => setBudgetItems(budgetItems.filter((_, i) => i !== index))} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#4b5563] hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          </div>
        ))}
          <button
            onClick={() => setBudgetItems([...budgetItems, { category: '', amount: '' }])}
            className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors"
            style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            + Add Category
          </button>
          <div className="flex justify-between items-center py-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[#9ca3af] text-sm">Total Budget</span>
            <span className="text-[#EF7722] text-base font-bold">₱{totalBudget.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>

          <ModalDivider />
          <ModalSectionLabel>PLACES TO EXPLORE</ModalSectionLabel>
          {places.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: 'rgba(11,166,223,0.15)', color: '#0BA6DF' }}>
              {index + 1}
            </div>
            <input type="text" placeholder="Place name" value={item.name}
              onChange={e => { const u = [...places]; u[index].name = e.target.value; setPlaces(u); }}
              className={darkInput} />
            {places.length > 1 && (
              <button onClick={() => setPlaces(places.filter((_, i) => i !== index))} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#4b5563] hover:text-red-400 hover:bg-red-400/10 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        ))}
          <button
            onClick={() => setPlaces([...places, { name: '' }])}
            className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors"
            style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            + Add Place
          </button>

          <ModalDivider />
          <ModalSectionLabel>TRAVEL COMPANIONS</ModalSectionLabel>
          <div
            className="flex flex-wrap items-center gap-2 min-h-[44px] rounded-[10px] px-3 py-2 cursor-text"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => { const input = e.currentTarget.querySelector('input'); if (input) input.focus(); }}
          >
            {companions.map(email => (
              <span key={email} className="flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11.5px] font-semibold"
                style={{ background: 'rgba(11,166,223,0.15)', border: '1px solid rgba(11,166,223,0.3)', color: '#0BA6DF' }}>
                {email}
                <button onClick={() => setCompanions(companions.filter(c => c !== email))}
                  className="text-[#60a5fa] text-sm leading-none ml-1 hover:text-white transition-colors">×</button>
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
                placeholder="Enter email and press Enter"
                value={companionEmail}
                onChange={e => setCompanionEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && companionEmail.trim()) {
                    e.preventDefault();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(companionEmail.trim())) { setError('Invalid email.'); return; }
                    const currentUserEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
                    if (companionEmail.trim().toLowerCase() === currentUserEmail?.toLowerCase()) { setError('You cannot add yourself as a companion.'); return; }
                    if (companions.includes(companionEmail.trim())) { setError('Already added.'); return; }
                    setCompanions([...companions, companionEmail.trim()]);
                    setCompanionEmail('');
                    setError('');
                  }
                }}
                className="bg-transparent border-none outline-none text-[#e5e7eb] text-[13px] w-full"
                style={{ paddingLeft: '24px' }}
              />
            </div>
          </div>
          <p className="text-[#6b7280] text-[11.5px] mt-[6px]">Companion must have an existing TravelLite account</p>

          <ModalDivider />
          <ModalSectionLabel>PACKING CHECKLIST</ModalSectionLabel>
          {checklistItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded flex-shrink-0" style={{ border: '1.5px solid #EF7722', background: 'transparent' }} />
            <input type="text" placeholder="Item name" value={item.name}
              onChange={e => { const u = [...checklistItems]; u[index].name = e.target.value; setChecklistItems(u); }}
              className={darkInput} />
            {checklistItems.length > 1 && (
              <button onClick={() => setChecklistItems(checklistItems.filter((_, i) => i !== index))} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#4b5563] hover:text-red-400 hover:bg-red-400/10 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        ))}
          <button
            onClick={() => setChecklistItems([...checklistItems, { name: '' }])}
            className="flex items-center gap-1 text-[#0BA6DF] text-xs font-bold px-[14px] py-2 rounded-[9px] transition-colors"
            style={{ border: '1.5px solid #0BA6DF', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11,166,223,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            + Add Item
          </button>
        </div>

        {/* Modal Footer */}
        <div
          className="flex-shrink-0 flex justify-between items-center px-6 py-4 rounded-b-2xl"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: '#1a2332' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-[10px] rounded-[10px] text-[#9ca3af] text-[13.5px] font-medium transition-all"
            style={{ border: '1.5px solid rgba(255,255,255,0.15)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#e5e7eb'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#9ca3af'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-7 py-[10px] rounded-[10px] text-white text-[13.5px] font-bold transition-all disabled:opacity-50"
            style={{ background: '#EF7722' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e06b18'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#EF7722'; }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal helpers ─── */
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