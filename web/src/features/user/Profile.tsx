import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadPhoto } from '../../api';
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  const [showCropModal, setShowCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [editingInfo, setEditingInfo] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(false);

    useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (editingInfo || showPasswordFields) {
        e.preventDefault();
        e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [editingInfo, showPasswordFields]);

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
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      updatedUser.first_name = firstName;
      updatedUser.last_name = lastName;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      setMessage('Profile updated successfully.');
      setEditingInfo(false);
      setShowPasswordFields(false);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const handleCropAndUpload = async () => {
    if (!imgRef.current || !completedCrop) return;
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0, 300, 300
    );
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      setShowCropModal(false);
      setPhotoLoading(true);
      try {
        const res = await uploadPhoto(file);
        const newPhotoUrl = res.data.data.photoUrl;
        setProfile((prev) => ({ ...prev, photoUrl: newPhotoUrl }));
        setMessage('Photo uploaded successfully.');
        // Force re-fetch profile to sync photoUrl
        const profileRes = await getProfile();
        setProfile(profileRes.data.data);
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        photo_url: newPhotoUrl,
      }));
      window.dispatchEvent(new Event('userUpdated'));
      } catch {
        setError('Failed to upload photo.');
      } finally {
        setPhotoLoading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const getInitials = () => {
    return `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #eef0f4 0%, #e4e8ee 50%, #dde3eb 100%)' }}>
      {/* Navbar */}
      <div className="bg-[#1F2937] px-8 py-3 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-4">
       <button
        type="button"
        onClick={() => {
        if (editingInfo || showPasswordFields) {
            setShowLeaveDialog(true);
        } else {
            navigate(-1);
        }
        }}
        className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10"
        >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        </button>
        <div className="flex items-center gap-3">
            <img src={require('../../assets/travellite.png')} alt="TravelLite" className="h-10 w-10 object-contain drop-shadow-md" />
            <div>
            <p className="text-white font-bold text-lg leading-none tracking-tight">TravelLite</p>
            <p className="text-gray-400 text-xs tracking-wide">Trip Planning Dashboard</p>
            </div>
        </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm font-medium">{profile.firstName} {profile.lastName}</span>
          <div className="rounded-full w-9 h-9 overflow-hidden shadow-md ring-2 ring-green-400 ring-opacity-30 flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#059669]">
            {profile.photoUrl ? (
           <img src={profile.photoUrl} alt="avatar" className="w-9 h-9 object-cover" />
            ) : (
                <span className="text-white text-sm font-bold">{getInitials()}</span>
            )}
            </div>
          <button className="text-[#EF7722] p-1.5 rounded-lg bg-white bg-opacity-10 cursor-default">
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

        <h2 className="text-2xl font-black text-[#111827] mb-6 tracking-tight">Profile Settings</h2>

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
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden mb-4 flex flex-col items-center">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 100%)' }} />
          <div className="p-8 flex flex-col items-center w-full">
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-green-100 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="avatar" className="w-24 h-24 object-cover" />
                ) : (getInitials())}
              </div>
            </div>
            <label className="flex items-center gap-2 border border-[#0BA6DF] text-[#0BA6DF] px-5 py-2 rounded-lg cursor-pointer text-sm font-semibold hover:bg-[#0BA6DF] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {photoLoading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" accept="image/jpeg,image/png" onChange={onSelectFile} className="hidden" />
            </label>
            <p className="text-gray-400 text-xs mt-2">JPG or PNG, max 2MB</p>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden mb-4">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 100%)' }} />
        <div className="p-6">
            <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-[#111827]">Personal Information</h3>
            <button
                onClick={() => { setEditingInfo(!editingInfo); setFirstName(profile.firstName); setLastName(profile.lastName); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${editingInfo ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
                {editingInfo ? (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Cancel</>
                ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Edit</>
                )}
            </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!editingInfo}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#111827] outline-none transition-all duration-200 ${editingInfo ? 'border-gray-200 focus:border-[#EF7722] focus:ring-2 focus:ring-orange-100 hover:border-gray-300' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}`} />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!editingInfo}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#111827] outline-none transition-all duration-200 ${editingInfo ? 'border-gray-200 focus:border-[#EF7722] focus:ring-2 focus:ring-orange-100 hover:border-gray-300' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}`} />
            </div>
            </div>
            <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
            <input value={profile.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
            </div>
        </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 overflow-hidden mb-6">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF7722 0%, #f59340 100%)' }} />
        <div className="p-6">
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
                {showPasswordFields ? 'Cancel' : 'Change Password'}
            </button>
            </div>
            {showPasswordFields && (
            <div className="mt-5 border-t border-gray-100 pt-5">
                <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#EF7722] focus:ring-2 focus:ring-orange-100 transition-all duration-200" />
                </div>
                <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#EF7722] focus:ring-2 focus:ring-orange-100 transition-all duration-200" />
                </div>
            </div>
            )}
        </div>
        </div>

        {/* Save Changes — only shows when editing */}
        {(editingInfo || showPasswordFields) && (
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#EF7722] to-[#f59340] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:from-[#e06b18] hover:to-[#EF7722] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-[#111827] mb-2">Crop Your Photo</h3>
            <p className="text-gray-400 text-sm mb-4">Drag to reposition. The crop area is fixed to a circle.</p>
            <div className="flex justify-center mb-6">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                  alt="crop preview"
                />
              </ReactCrop>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCropModal(false); setImgSrc(''); }}
                className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-semibold hover:border-gray-300 hover:text-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCropAndUpload}
                disabled={photoLoading}
                className="flex-1 bg-gradient-to-r from-[#EF7722] to-[#f59340] text-white py-2.5 rounded-xl text-sm font-bold shadow-lg hover:from-[#e06b18] hover:to-[#EF7722] transition-all duration-200 disabled:opacity-50"
              >
                {photoLoading ? 'Uploading...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#EF7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1 text-center">Unsaved Changes</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">
              You have unsaved changes. Do you want to leave without saving?
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowLeaveDialog(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all font-medium">
                Stay
              </button>
              <button type="button" onClick={() => { setShowLeaveDialog(false); navigate(-1); }}
                className="flex-1 px-4 py-2.5 bg-[#EF7722] text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}