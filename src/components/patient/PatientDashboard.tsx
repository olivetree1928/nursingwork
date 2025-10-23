import { useState } from 'react';
import { Search, Calendar, Bell, User, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CaregiverSearch from './CaregiverSearch';
import BookingList from './BookingList';
import NotificationList from './NotificationList';

type TabType = 'search' | 'bookings' | 'notifications' | 'profile';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const { profile, signOut } = useAuth();

  const tabs = [
    { id: 'search' as TabType, name: '查找护工', icon: Search },
    { id: 'bookings' as TabType, name: '我的预约', icon: Calendar },
    { id: 'notifications' as TabType, name: '通知', icon: Bell },
    { id: 'profile' as TabType, name: '个人中心', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">护工调度系统</h1>
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
                    ? 'bg-blue-600 text-white'
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
          {activeTab === 'search' && <CaregiverSearch />}
          {activeTab === 'bookings' && <BookingList />}
          {activeTab === 'notifications' && <NotificationList />}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">个人信息</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    电话
                  </label>
                  <input
                    type="tel"
                    value={profile?.phone || ''}
                    placeholder="未设置"
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    支付方式
                  </h3>
                  <p className="text-gray-600">支持支付宝、微信支付、银行卡等多种支付方式</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
