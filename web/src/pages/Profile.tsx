import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadPhoto } from '../api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    photoUrl: '',
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    getProfile().then((res) => {
      const data = res.data.data;
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
    }).catch(() => navigate('/login'));
  }, [navigate]);

  const handleUpdateProfile = async () => {
    setError('');
    setMessage('');
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const payload: any = { firstName, lastName };
      if (password) payload.password = password;
      const res = await updateProfile(payload);
      setProfile(res.data.data);
      setPassword('');
      setConfirmPassword('');
      setMessage('Profile updated successfully.');
    } catch {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG or PNG files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Photo must not exceed 2MB.');
      return;
    }
    setPhotoLoading(true);
    try {
      const res = await uploadPhoto(file);
      setProfile((prev) => ({ ...prev, photoUrl: res.data.data.photoUrl }));
      setMessage('Photo uploaded successfully.');
    } catch {
      setError('Failed to upload photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const getInitials = () => {
    return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Navbar */}
      <div className="bg-[#1F2937] px-8 py-3 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={require('../assets/travellite.png')} alt="TravelLite" className="h-10 w-10 object-contain drop-shadow-md" />
          <div>
            <p className="text-white font-bold text-lg leading-none tracking-tight">TravelLite</p>
            <p className="text-gray-400 text-xs tracking-wide">Trip Planning Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm font-medium">{profile.firstName} {profile.lastName}</span>
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full w-9 h-9 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-green-400 ring-opacity-30">
            {getInitials()}
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400 hover:bg-opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 text-sm mb-6 hover:text-[#EF7722] transition-colors duration-200 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        <h2 className="text-2xl font-bold text-[#111827] mb-6 tracking-tight">Profile Settings</h2>

        {/* Success/Error Messages */}
        {message && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Photo Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-4 flex flex-col items-center hover:shadow-lg transition-shadow duration-300">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-green-100 overflow-hidden transition-transform duration-300 group-hover:scale-105">
              {profile.photoUrl ? (
                <img src={`http://localhost:8080${profile.photoUrl}`} alt="avatar" className="w-24 h-24 object-cover" />
              ) : (
                getInitials()
              )}
            </div>
          </div>
          <label className="flex items-center gap-2 border border-[#0BA6DF] text-[#0BA6DF] px-5 py-2 rounded-lg cursor-pointer text-sm font-semibold hover:bg-[#0BA6DF] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {photoLoading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} className="hidden" />
          </label>
          <p className="text-gray-400 text-xs mt-2">JPG or PNG, max 2MB</p>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-bold text-[#111827] mb-5">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">First Name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111827] outline-none focus:border-[#EF7722] focus:ring-2 focus:ring-orange-100 transition-all duration-200 hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#111827] outline-none focus:border-[#EF7722] focus:ring-2 focus:ring-orange-100 transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
            <input
              value={profile.email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Change Password</h3>
              {!showPasswordFields && (
                <p className="text-gray-400 text-sm mt-1">Click "Change Password" to update your password</p>
              )}
            </div>
            <button
              onClick={() => { setShowPasswordFields(!showPasswordFields); setPassword(''); setConfirmPassword(''); }}
              className="border border-[#0BA6DF] text-[#0BA6DF] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0BA6DF] hover:text-white transition-all duration-200 flex-shrink-0"
            >
              Change Password
            </button>
          </div>

          {showPasswordFields && (
            <div className="mt-5 border-t border-gray-100 pt-5">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#EF7722] focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#EF7722] focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#EF7722] to-[#f59340] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:from-[#e06b18] hover:to-[#EF7722] transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
