import { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Clock, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BookingModal from './BookingModal';

interface Caregiver {
  id: string;
  user_id: string;
  gender: string;
  age: number;
  years_of_experience: number;
  skills: string[];
  bio: string;
  hourly_rate: number;
  is_available: boolean;
  rating_average: number;
  total_reviews: number;
  certifications: string[];
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

export default function CaregiverSearch() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadCaregivers();
  }, []);

  const loadCaregivers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('caregiver_profiles')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .order('rating_average', { ascending: false });

    if (error) {
      console.error('Error loading caregivers:', error);
    } else {
      setCaregivers(data as any);
    }
    setLoading(false);
  };

  const filteredCaregivers = caregivers.filter((caregiver) => {
    const matchesSearch =
      caregiver.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = genderFilter === 'all' || caregiver.gender === genderFilter;
    const matchesAvailable = !availableOnly || caregiver.is_available;

    return matchesSearch && matchesGender && matchesAvailable;
  });

  const handleBookClick = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索护工姓名或专业技能..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              availableOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            仅显示可预约
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCaregivers.map((caregiver) => (
          <div
            key={caregiver.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {caregiver.profiles.full_name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {caregiver.profiles.full_name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    {caregiver.gender === 'male' ? '男' : '女'} • {caregiver.age}岁
                  </div>
                </div>
              </div>
              {caregiver.is_available && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  可预约
                </span>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{caregiver.years_of_experience}年经验</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-gray-700">
                  {caregiver.rating_average.toFixed(1)} ({caregiver.total_reviews}条评价)
                </span>
              </div>
              {caregiver.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {caregiver.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {caregiver.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                      +{caregiver.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {caregiver.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{caregiver.bio}</p>
            )}

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  ¥{caregiver.hourly_rate}
                </div>
                <div className="text-xs text-gray-500">每小时</div>
              </div>
              <button
                onClick={() => handleBookClick(caregiver)}
                disabled={!caregiver.is_available}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                立即预约
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCaregivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">未找到符合条件的护工</p>
        </div>
      )}

      {showBookingModal && selectedCaregiver && (
        <BookingModal
          caregiver={selectedCaregiver}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedCaregiver(null);
          }}
          onSuccess={() => {
            setShowBookingModal(false);
            setSelectedCaregiver(null);
          }}
        />
      )}
    </div>
  );
}
