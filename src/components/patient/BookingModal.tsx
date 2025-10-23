import { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BookingModalProps {
  caregiver: {
    id: string;
    user_id: string;
    hourly_rate: number;
    profiles: {
      full_name: string;
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ caregiver, onClose, onSuccess }: BookingModalProps) {
  const { user } = useAuth();
  const [serviceType, setServiceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [hours, setHours] = useState('4');
  const [address, setAddress] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalCost = parseFloat(hours) * caregiver.hourly_rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseFloat(hours) * 60 * 60 * 1000);

      const { error: bookingError } = await supabase.from('bookings').insert({
        patient_id: user.id,
        caregiver_id: caregiver.user_id,
        service_type: serviceType,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        total_hours: parseFloat(hours),
        hourly_rate: caregiver.hourly_rate,
        total_cost: totalCost,
        address,
        special_requirements: specialRequirements || null,
        status: 'pending',
      });

      if (bookingError) throw bookingError;

      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: caregiver.user_id,
        title: '新的预约请求',
        message: `您收到一个新的预约请求，服务时间：${startDate} ${startTime}`,
        type: 'booking',
      });

      if (notificationError) console.error('Error creating notification:', notificationError);

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">预约护工服务</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="font-semibold text-gray-900 mb-1">
              {caregiver.profiles.full_name}
            </div>
            <div className="text-sm text-gray-600">
              ¥{caregiver.hourly_rate}/小时
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              服务类型
            </label>
            <select
              required
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择服务类型</option>
              <option value="老人护理">老人护理</option>
              <option value="病患护理">病患护理</option>
              <option value="术后康复">术后康复</option>
              <option value="日常陪护">日常陪护</option>
              <option value="医院陪护">医院陪护</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                开始日期
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                开始时间
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              服务时长（小时）
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              服务地址
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入详细地址"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              特殊要求（可选）
            </label>
            <textarea
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请描述特殊需求或注意事项"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                总费用
              </span>
              <span className="text-blue-600">¥{totalCost.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {hours}小时 × ¥{caregiver.hourly_rate}/小时
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '提交中...' : '确认预约'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
