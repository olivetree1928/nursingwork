import { useState, useEffect } from 'react';
import { Save, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CaregiverProfileData {
  gender: string;
  age: number;
  years_of_experience: number;
  skills: string[];
  bio: string;
  hourly_rate: number;
  is_available: boolean;
  certifications: string[];
}

export default function CaregiverProfile() {
  const { user, profile } = useAuth();
  const [profileData, setProfileData] = useState<CaregiverProfileData>({
    gender: 'female',
    age: 30,
    years_of_experience: 0,
    skills: [],
    bio: '',
    hourly_rate: 50,
    is_available: true,
    certifications: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('caregiver_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
    } else if (data) {
      setProfileData(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const { data: existingProfile } = await supabase
        .from('caregiver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('caregiver_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('caregiver_profiles')
          .insert({ ...profileData, user_id: user.id });

        if (error) throw error;
      }

      setMessage('保存成功！');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skill),
    });
  };

  const addCertification = () => {
    if (
      newCertification.trim() &&
      !profileData.certifications.includes(newCertification.trim())
    ) {
      setProfileData({
        ...profileData,
        certifications: [...profileData.certifications, newCertification.trim()],
      });
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setProfileData({
      ...profileData,
      certifications: profileData.certifications.filter((c) => c !== cert),
    });
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">个人资料</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.includes('成功')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input
            type="text"
            value={profile?.full_name || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <select
              value={profileData.gender}
              onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="female">女</option>
              <option value="male">男</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
            <input
              type="number"
              min="18"
              max="100"
              value={profileData.age}
              onChange={(e) =>
                setProfileData({ ...profileData, age: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工作经验（年）
            </label>
            <input
              type="number"
              min="0"
              value={profileData.years_of_experience}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  years_of_experience: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              时薪（元/小时）
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={profileData.hourly_rate}
              onChange={(e) =>
                setProfileData({ ...profileData, hourly_rate: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={profileData.is_available}
              onChange={(e) =>
                setProfileData({ ...profileData, is_available: e.target.checked })
              }
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">当前可接单</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">专业技能</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="输入技能后按回车添加"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              添加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">资格证书</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCertification()}
              placeholder="输入证书名称后按回车添加"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addCertification}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              添加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.certifications.map((cert) => (
              <span
                key={cert}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {cert}
                <button
                  type="button"
                  onClick={() => removeCertification(cert)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            rows={4}
            placeholder="介绍您的工作经验、专长和服务理念..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
