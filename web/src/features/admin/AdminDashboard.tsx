import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';

interface AdminDashboardData {
  totalUsers: number;
  totalTrips: number;
}

interface AdminUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

interface AdminTrip {
  tripId: number;
  title: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  createdBy: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchTrips();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data);
    } catch { navigate('/login'); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
    } catch {}
  };

  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/admin/trips', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(res.data.data);
    } catch {}
  };

  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;
  const recentUsers = [...users].slice(-5).reverse();
  const recentTrips = [...trips].slice(-5).reverse();

  const destinationCount: Record<string, number> = {};
  trips.forEach(t => {
    const dest = t.destination.split(',')[0].trim();
    destinationCount[dest] = (destinationCount[dest] || 0) + 1;
  });
  const topDestinations = Object.entries(destinationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const statCards = [
    {
      label: 'Total Users',
      value: data?.totalUsers ?? '...',
      gradient: 'linear-gradient(90deg, #0BA6DF 0%, #0891c2 100%)',
      iconBg: 'linear-gradient(135deg, #0BA6DF 0%, #0891c2 100%)',
      shadowColor: 'rgba(11,166,223,0.15)',
      hoverShadow: '0 20px 40px rgba(11,166,223,0.2)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Trips',
      value: data?.totalTrips ?? '...',
      gradient: 'linear-gradient(90deg, #EF7722 0%, #f59340 100%)',
      iconBg: 'linear-gradient(135deg, #EF7722 0%, #f59340 100%)',
      shadowColor: 'rgba(239,119,34,0.15)',
      hoverShadow: '0 20px 40px rgba(239,119,34,0.2)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      label: 'Active Users',
      value: activeUsers,
      gradient: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
      iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      shadowColor: 'rgba(16,185,129,0.15)',
      hoverShadow: '0 20px 40px rgba(16,185,129,0.2)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Suspended',
      value: inactiveUsers,
      gradient: 'linear-gradient(90deg, #EF4444 0%, #dc2626 100%)',
      iconBg: 'linear-gradient(135deg, #EF4444 0%, #dc2626 100%)',
      shadowColor: 'rgba(239,68,68,0.15)',
      hoverShadow: '0 20px 40px rgba(239,68,68,0.2)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <h1 className="text-3xl font-black text-[#111827] mb-1 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mb-8">Overview of all system activity</p>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-default group"
              style={{ boxShadow: `0 4px 20px ${card.shadowColor}`, border: '1px solid rgba(255,255,255,0.9)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = card.hoverShadow;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${card.shadowColor}`;
              }}
            >
              <div className="h-1 w-full" style={{ background: card.gradient }} />
              <div className="p-5 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{card.label}</p>
                  <p className="text-3xl font-black text-[#111827] tabular-nums transition-all duration-300 group-hover:scale-105 origin-left">
                    {card.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: card.iconBg, boxShadow: `0 4px 12px ${card.shadowColor}` }}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Middle Row: Recent Users + Top Destinations ── */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          {/* Recent Users */}
          <div
            className="col-span-2 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(255,255,255,0.9)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(11,166,223,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0BA6DF 0%, #0891c2 100%)' }} />
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(11,166,223,0.1)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0BA6DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-sm font-black text-[#111827] tracking-tight">Recently Registered Users</h2>
              </div>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-xs font-bold text-[#0BA6DF] flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-blue-50"
              >
                View All <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentUsers.map(u => (
                <div
                  key={u.userId}
                  className="px-6 py-3 flex items-center gap-4 transition-all duration-200 cursor-pointer group/row"
                  style={{ background: 'white' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(11,166,223,0.04)'; (e.currentTarget as HTMLDivElement).style.paddingLeft = '28px'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'white'; (e.currentTarget as HTMLDivElement).style.paddingLeft = '24px'; }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-all duration-200 group-hover/row:scale-110 group-hover/row:rotate-3"
                    style={{ background: 'linear-gradient(135deg, #0BA6DF 0%, #0891c2 100%)', boxShadow: '0 4px 12px rgba(11,166,223,0.3)' }}
                  >
                    {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] truncate transition-colors duration-200 group-hover/row:text-[#0BA6DF]">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 transition-all duration-200 group-hover/row:scale-105"
                    style={{
                      background: u.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                      color: u.isActive ? '#065F46' : '#991B1B',
                    }}
                  >
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Destinations */}
          <div
            className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(255,255,255,0.9)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(239,119,34,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 100%)' }} />
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-sm font-black text-[#111827] tracking-tight">Top Destinations</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {topDestinations.length === 0 ? (
                <p className="text-gray-300 text-sm text-center py-4">No data yet</p>
              ) : (
                topDestinations.map(([dest, count], index) => (
                  <div
                    key={dest}
                    className="group/dest rounded-xl px-2 py-1 -mx-2 transition-all duration-200 cursor-default"
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(239,119,34,0.04)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-sm font-semibold text-[#111827] transition-colors duration-200 group-hover/dest:text-[#EF7722]">
                          {dest}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#EF7722] transition-all duration-200 group-hover/dest:scale-110">
                        {count} trips
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500 group-hover/dest:opacity-80"
                        style={{
                          width: `${(count / (topDestinations[0][1] || 1)) * 100}%`,
                          background: index === 0
                            ? 'linear-gradient(90deg, #EF7722, #f59340)'
                            : index === 1
                            ? 'linear-gradient(90deg, #0BA6DF, #0891c2)'
                            : 'linear-gradient(90deg, #10B981, #059669)',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Recent Trips ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(255,255,255,0.9)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(239,119,34,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
        >
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 60%, #0BA6DF 100%)' }} />
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,119,34,0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h2 className="text-sm font-black text-[#111827] tracking-tight">Recently Created Trips</h2>
            </div>
            <button
              onClick={() => navigate('/admin/trips')}
              className="text-xs font-bold text-[#EF7722] flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-orange-50"
            >
              View All →
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Trip Title', 'Destination', 'From', 'Start Date', 'End Date', 'Created By'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-bold text-xs uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTrips.map((trip) => (
                <tr
                  key={trip.tripId}
                  className="transition-all duration-200 cursor-pointer group/trip"
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(239,119,34,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  <td className="px-6 py-3 font-bold text-[#111827] transition-colors duration-200 group-hover/trip:text-[#EF7722]">
                    {trip.title}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100 text-[#0BA6DF] transition-all duration-200 group-hover/trip:bg-blue-100"
                      style={{ background: 'rgba(11,166,223,0.08)' }}
                    >
                      {trip.destination}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{trip.origin}</td>
                  <td className="px-6 py-3 text-gray-500">{trip.startDate}</td>
                  <td className="px-6 py-3 text-gray-500">{trip.endDate}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-transform duration-200 group-hover/trip:scale-110"
                        style={{ background: 'linear-gradient(135deg, #EF7722 0%, #f59340 100%)' }}
                      >
                        {trip.createdBy.charAt(0)}
                      </div>
                      <span className="text-gray-600 text-sm">{trip.createdBy}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Quick Actions ── */}
        <div className="flex gap-4 mt-5">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group/btn"
            style={{ background: 'linear-gradient(135deg, #0BA6DF 0%, #0891c2 100%)', boxShadow: '0 4px 15px rgba(11,166,223,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(11,166,223,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(11,166,223,0.3)'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Users
          </button>
          <button
            onClick={() => navigate('/admin/trips')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold transition-all duration-200 hover:-translate-y-1 group/btn2"
            style={{ background: 'linear-gradient(135deg, #EF7722 0%, #f59340 100%)', boxShadow: '0 4px 15px rgba(239,119,34,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(239,119,34,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(239,119,34,0.3)'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover/btn2:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Manage Trips
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}