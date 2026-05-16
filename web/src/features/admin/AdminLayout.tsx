import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/travellite.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (storedUser.role !== 'ADMIN') {
    navigate('/dashboard');
    return;
  }
  fetchProfile();
  const sync = () => setUser(JSON.parse(localStorage.getItem('user') || '{}'));
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
      const d = res.data.data;
      setUser((prev: any) => ({ ...prev, photo_url: d.photoUrl, first_name: d.firstName, last_name: d.lastName }));
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUserInitials = () =>
    `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  const navItems = [
    {
      label: 'Dashboard', path: '/admin',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    },
    {
      label: 'User Management', path: '/admin/users',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      label: 'Trip Management', path: '/admin/trips',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #eef0f4 0%, #e4e8ee 50%, #dde3eb 100%)' }}>

      {/* ── Navbar — exact same as user side ── */}
      <div className="bg-[#1F2937] px-8 py-3 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={logo} alt="TravelLite" className="h-10 w-10 object-contain drop-shadow-md" />
          <div>
            <p className="text-white font-bold text-lg leading-none tracking-tight">TravelLite</p>
            <p className="text-gray-400 text-xs tracking-wide">Admin Panel</p>
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
          <button onClick={() => navigate('/admin/profile')}
            className="text-gray-400 hover:text-white transition-all duration-200 p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 hover:scale-110"
            title="Profile Settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-400 hover:bg-opacity-10 hover:scale-110"
            title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* ── Sidebar ── */}
        <div className="w-60 min-h-[calc(100vh-64px)] bg-[#1F2937] px-3 py-6 shadow-lg flex flex-col justify-between">
          <div>
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.path} onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-1 cursor-pointer text-sm font-semibold transition-all duration-200"
                  style={{ background: isActive ? '#EF7722' : 'transparent', color: isActive ? 'white' : '#9CA3AF' }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#374151'; e.currentTarget.style.color = 'white'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; } }}>
                  {item.icon} {item.label}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-4 py-3 border-t border-white border-opacity-10">
            <div className="rounded-full w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#059669] text-white text-xs font-bold overflow-hidden">
              {user.photo_url
                ? <img src={`http://localhost:8080${user.photo_url}`} alt="avatar" className="w-8 h-8 object-cover" />
                : getUserInitials()}
            </div>
            <div>
              <p className="text-white text-xs font-semibold">{user.first_name} {user.last_name}</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
          </div>
        </div>

        {/* ── Page Content ── */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}