import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB]">
      <div className="bg-[#1F2937] px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#EF7722] rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">TravelLite</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white text-sm">{user.first_name} {user.last_name}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Logout</button>
        </div>
      </div>

      <div className="px-8 py-10">
        <h1 className="text-3xl font-bold text-[#111827] mb-1">
          Welcome back, {user.first_name}! 👋
        </h1>
        <p className="text-gray-500">Manage your upcoming trips and track your travel budget</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total Trips</p>
            <p className="text-4xl font-bold text-[#111827] mt-1">0</p>
            <p className="text-gray-400 text-sm">Across all destinations</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Overall Expense</p>
            <p className="text-4xl font-bold text-[#111827] mt-1">₱0</p>
            <p className="text-gray-400 text-sm">Total budget spent</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Upcoming Travels</p>
            <p className="text-4xl font-bold text-[#111827] mt-1">0</p>
            <p className="text-gray-400 text-sm">Trips coming up</p>
          </div>
        </div>
      </div>
    </div>
  );
}