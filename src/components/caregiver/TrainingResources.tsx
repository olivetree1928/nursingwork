import { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TrainingResource {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'article' | 'document';
  content_url: string;
  category: string;
  created_at: string;
}

export default function TrainingResources() {
  const [resources, setResources] = useState<TrainingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    const { data, error } = await supabase
      .from('training_resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading resources:', error);
    } else {
      setResources(data);
    }
    setLoading(false);
  };

  const categories = ['all', ...new Set(resources.map((r) => r.category))];

  const filteredResources =
    selectedCategory === 'all'
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'article':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <BookOpen className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video':
        return '视频';
      case 'article':
        return '文章';
      case 'document':
        return '文档';
      default:
        return type;
    }
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
        <h2 className="text-2xl font-bold text-gray-900">培训资源</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">全部分类</option>
          {categories
            .filter((c) => c !== 'all')
            .map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
        </select>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无培训资源</p>
          <p className="text-gray-400 text-sm mt-2">
            系统管理员将定期发布专业护理培训内容
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">{getIcon(resource.content_type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {resource.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {getTypeText(resource.content_type)}
                    </span>
                    <a
                      href={resource.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      查看内容
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-6 mt-8">
        <h3 className="font-semibold text-gray-900 mb-3">护理知识分享</h3>
        <p className="text-gray-700 text-sm mb-4">
          欢迎在护工社区分享您的工作经验和心得，与同行交流专业护理知识，共同提升服务质量。
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          进入社区交流
        </button>
      </div>
    </div>
  );
}
