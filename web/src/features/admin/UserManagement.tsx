import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';

interface AdminUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('token');
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: 'suspend' | 'delete';
    userId: number;
    userName: string;
  }>({ show: false, type: 'suspend', userId: 0, userName: '' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
    } catch { navigate('/login'); }
  };

  const handleConfirmAction = async () => {
    const { type, userId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, show: false }));
    try {
      if (type === 'suspend') {
        await axios.patch(`http://localhost:8080/api/v1/admin/users/${userId}/suspend`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.delete(`http://localhost:8080/api/v1/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchUsers();
    } catch { alert(`Failed to ${type} user.`); }
  };

  const filteredUsers = users.filter(u =>
    u.userId.toString().includes(search) ||
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;

  return (
    <AdminLayout>
      <div className="px-8 py-10">
        <h1 className="text-3xl font-black text-[#111827] mb-1 tracking-tight">User Management</h1>
        <p className="text-gray-500 text-sm mb-6">Manage all registered user accounts</p>

        {/* ── Summary Badges ── */}
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#0BA6DF]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</span>
            <span className="text-sm font-black text-[#111827]">{users.length}</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active</span>
            <span className="text-sm font-black text-[#111827]">{activeCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Suspended</span>
            <span className="text-sm font-black text-[#111827]">{inactiveCount}</span>
          </div>
        </div>

        {/* ── Main Table Card ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden transition-all duration-300"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid rgba(255,255,255,0.9)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(11,166,223,0.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
        >
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 60%, #0BA6DF 100%)' }} />

          {/* Table Header */}
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(11,166,223,0.1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0BA6DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-base font-black text-[#111827] tracking-tight">All Users</h2>
            <span className="bg-blue-50 text-[#0BA6DF] text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-100">
              {filteredUsers.length} users
            </span>

            {/* Search Box */}
            <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-72 focus-within:border-[#0BA6DF] focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by ID, name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
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
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #1F2937 0%, #374151 100%)' }}>
                {['ID', 'First Name', 'Last Name', 'Email', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left font-bold text-xs uppercase tracking-widest text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(11,166,223,0.08)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-semibold">No users found</p>
                        <p className="text-gray-400 text-xs mt-0.5">No results for "<span className="text-[#0BA6DF] font-bold">{search}</span>"</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr
                    key={u.userId}
                    className="transition-all duration-200 group/row"
                    style={{ background: index % 2 === 0 ? 'white' : 'rgba(249,250,251,0.5)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(11,166,223,0.03)';
                      (e.currentTarget as HTMLTableRowElement).style.boxShadow = 'inset 3px 0 0 #0BA6DF';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLTableRowElement).style.background = index % 2 === 0 ? 'white' : 'rgba(249,250,251,0.5)';
                      (e.currentTarget as HTMLTableRowElement).style.boxShadow = 'none';
                    }}
                  >
                    <td className="px-6 py-4 text-gray-400 text-sm tabular-nums font-medium">{u.userId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-all duration-200 group-hover/row:scale-110 group-hover/row:rotate-3"
                          style={{ background: 'linear-gradient(135deg, #0BA6DF 0%, #0891c2 100%)', boxShadow: '0 2px 8px rgba(11,166,223,0.3)' }}
                        >
                          {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                        </div>
                        <span className="font-semibold text-[#111827] transition-colors duration-200 group-hover/row:text-[#0BA6DF]">
                          {u.firstName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#111827]">{u.lastName}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 group-hover/row:scale-105"
                        style={{
                          background: u.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                          color: u.isActive ? '#065F46' : '#991B1B',
                          borderColor: u.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        }}
                      >
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmModal({ show: true, type: 'suspend', userId: u.userId, userName: `${u.firstName} ${u.lastName}` })}
                          disabled={!u.isActive}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 hover:-translate-y-0.5"
                          style={{
                            borderColor: '#FAA533',
                            color: '#FAA533',
                            background: 'transparent',
                            opacity: u.isActive ? 1 : 0.35,
                            cursor: u.isActive ? 'pointer' : 'not-allowed',
                          }}
                          onMouseEnter={e => { if (u.isActive) { e.currentTarget.style.background = '#FAA533'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(250,165,51,0.35)'; } }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FAA533'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => setConfirmModal({ show: true, type: 'delete', userId: u.userId, userName: `${u.firstName} ${u.lastName}` })}
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
                ))
              )}
            </tbody>
          </table>

          {/* ── Footer ── */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6', background: '#FAFAFA' }}>
              <p className="text-xs text-gray-400">
                Showing <span className="font-bold text-gray-600">{filteredUsers.length}</span> of <span className="font-bold text-gray-600">{users.length}</span> users
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />
                  {activeCount} active
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block" />
                  {inactiveCount} suspended
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 transition-all duration-200"
            style={{ animation: 'slideUp 0.2s ease-out' }}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'suspend' ? 'bg-orange-50' : 'bg-red-50'}`}>
              {confirmModal.type === 'suspend' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FAA533]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6M14 11v6" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1 text-center">
              {confirmModal.type === 'suspend' ? 'Suspend User' : 'Delete User'}
            </h3>
            <p className="text-gray-400 text-sm mb-6 text-center">
              Are you sure you want to {confirmModal.type === 'suspend' ? 'suspend' : 'permanently delete'}{' '}
              <span className="font-semibold text-[#111827]">"{confirmModal.userName}"</span>?
              {confirmModal.type === 'delete' && (
                <span className="block text-red-400 text-xs mt-1">This action cannot be undone.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: confirmModal.type === 'suspend' ? '#FAA533' : '#EF4444',
                  boxShadow: confirmModal.type === 'suspend' ? '0 4px 12px rgba(250,165,51,0.4)' : '0 4px 12px rgba(239,68,68,0.4)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = confirmModal.type === 'suspend' ? '0 8px 20px rgba(250,165,51,0.5)' : '0 8px 20px rgba(239,68,68,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = confirmModal.type === 'suspend' ? '0 4px 12px rgba(250,165,51,0.4)' : '0 4px 12px rgba(239,68,68,0.4)'; }}
              >
                {confirmModal.type === 'suspend' ? 'Suspend' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}