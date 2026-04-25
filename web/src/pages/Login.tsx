import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-[#1F2937] rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#EF7722] rounded-full p-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold">TravelLite</h1>
          <p className="text-gray-400 text-sm">Your complete trip planning companion</p>
        </div>

        <h2 className="text-white text-2xl font-bold text-center mb-1">Welcome back</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} className="text-[#EF7722] cursor-pointer hover:underline">Sign up</span>
        </p>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#374151] text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7722]"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#374151] text-white rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7722]"
              />
              <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 cursor-pointer">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4" />
              Remember me
            </label>
            <span className="text-[#EF7722] text-sm cursor-pointer hover:underline">Forgot Password?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EF7722] text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="text-gray-400 text-sm mx-2">or</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        <button
          onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
          className="w-full bg-[#374151] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-gray-500 text-xs text-center mt-4">
          By signing in, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}