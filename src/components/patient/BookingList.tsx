import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ReviewModal from './ReviewModal';

interface Booking {
  id: string;
  service_type: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_cost: number;
  status: string;
  address: string;
  special_requirements: string | null;
  caregiver: {
    full_name: string;
  };
}

export default function BookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        caregiver:caregiver_id (
          full_name
        )
      `)
      .eq('patient_id', user.id)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error loading bookings:', error);
    } else {
      setBookings(data as any);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待确认';
      case 'confirmed':
        return '已确认';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const handleReviewClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">我的预约</h2>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无预约记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.service_type}
                  </h3>
                  <p className="text-gray-600">护工: {booking.caregiver.full_name}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {getStatusText(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {new Date(booking.start_time).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {new Date(booking.start_time).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    - {booking.total_hours}小时
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{booking.address}</span>
                </div>
              </div>

              {booking.special_requirements && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>特殊要求：</strong>
                    {booking.special_requirements}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-lg font-semibold text-blue-600">
                  ¥{booking.total_cost.toFixed(2)}
                </div>
                {booking.status === 'completed' && (
                  <button
                    onClick={() => handleReviewClick(booking)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    评价
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showReviewModal && selectedBooking && (
        <ReviewModal
          bookingId={selectedBooking.id}
          caregiverId={selectedBooking.caregiver.full_name}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
            loadBookings();
          }}
        />
      )}
    </div>
  );
}
