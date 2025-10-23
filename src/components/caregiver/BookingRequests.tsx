import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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
  patient: {
    full_name: string;
    phone: string | null;
  };
}

export default function BookingRequests() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
        patient:patient_id (
          full_name,
          phone
        )
      `)
      .eq('caregiver_id', user.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error loading bookings:', error);
    } else {
      setBookings(data as any);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking:', error);
    } else {
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        await supabase.from('notifications').insert({
          user_id: booking.patient.full_name,
          title: status === 'confirmed' ? '预约已确认' : '预约已取消',
          message: `您的预约请求已${status === 'confirmed' ? '确认' : '取消'}`,
          type: 'booking',
          related_booking_id: bookingId,
        });
      }
      loadBookings();
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const otherBookings = bookings.filter((b) => b.status !== 'pending');

  return (
    <div className="space-y-8">
      {pendingBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">待确认预约</h2>
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.service_type}
                    </h3>
                    <p className="text-gray-600">患者: {booking.patient.full_name}</p>
                    {booking.patient.phone && (
                      <p className="text-gray-600 text-sm">电话: {booking.patient.phone}</p>
                    )}
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
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>特殊要求：</strong>
                      {booking.special_requirements}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-yellow-200">
                  <div className="text-lg font-semibold text-gray-900">
                    ¥{booking.total_cost.toFixed(2)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      拒绝
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      接受
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">所有预约</h2>
        {otherBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无其他预约</p>
          </div>
        ) : (
          <div className="space-y-4">
            {otherBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.service_type}
                    </h3>
                    <p className="text-gray-600">患者: {booking.patient.full_name}</p>
                    {booking.patient.phone && (
                      <p className="text-gray-600 text-sm">电话: {booking.patient.phone}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(booking.start_time).toLocaleDateString('zh-CN')}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
