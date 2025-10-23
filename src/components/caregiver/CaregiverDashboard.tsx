import { useState } from 'react';
import { Calendar, BookOpen, User, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import BookingRequests from './BookingRequests';
import TrainingResources from './TrainingResources';
import CaregiverProfile from './CaregiverProfile';

type TabType = 'bookings' | 'training' | 'profile';

export default function CaregiverDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const { profile, signOut } = useAuth();

  const tabs = [
    { id: 'bookings' as TabType, name: '预约管理', icon: Calendar },
    { id: 'training' as TabType, name: '培训学习', icon: BookOpen },
    { id: 'profile' as TabType, name: '个人中心', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">护工工作台</h1>
              <p className="text-sm text-gray-500">欢迎, {profile?.full_name}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-4 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'bookings' && <BookingRequests />}
          {activeTab === 'training' && <TrainingResources />}
          {activeTab === 'profile' && <CaregiverProfile />}
        </div>
      </div>
    </div>
  );
}
