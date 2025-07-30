import React from 'react';
import { BookOpen, Brain, Trophy, Settings, ArrowRight, Users, Clock, Target } from 'lucide-react';
import { UserRole } from '../hooks/useAuth';

interface HomeProps {
  totalQuestions: number;
  totalSubjects: number;
  totalExams: number;
  userRole: UserRole;
}

const Home: React.FC<HomeProps> = ({ totalQuestions, totalSubjects, totalExams, userRole }) => {
  const features = [
    {
      icon: Settings,
      title: 'Quản lý câu hỏi',
      description: 'Thêm, sửa, xóa câu hỏi trắc nghiệm một cách dễ dàng',
      action: () => window.location.href = '#manage',
      color: 'bg-blue-500 hover:bg-blue-600',
      stats: `${totalQuestions} câu hỏi`,
      show: userRole === 'admin'
    },
    {
      icon: BookOpen,
      title: 'Học Flashcard',
      description: 'Học và ghi nhớ kiến thức qua hệ thống thẻ ghi nhớ',
      action: () => window.location.href = '#flashcard',
      color: 'bg-green-500 hover:bg-green-600',
      stats: 'Học tương tác',
      show: true
    },
    {
      icon: Brain,
      title: 'Làm Quiz',
      description: 'Kiểm tra kiến thức với các câu hỏi trắc nghiệm ngẫu nhiên',
      action: () => window.location.href = '#quiz',
      color: 'bg-purple-500 hover:bg-purple-600',
      stats: 'Tự động chấm điểm',
      show: true
    },
    {
      icon: Trophy,
      title: 'Xem kết quả',
      description: 'Theo dõi tiến trình học tập và kết quả các bài kiểm tra',
      action: () => window.location.href = '#results',
      color: 'bg-orange-500 hover:bg-orange-600',
      stats: 'Kết quả học tập',
      show: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QuizMaster
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Nền tảng học tập trắc nghiệm hiện đại với flashcard tương tác và hệ thống quiz thông minh. 
            Nâng cao kiến thức của bạn một cách hiệu quả và thú vị.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-900">Dễ sử dụng</p>
              <p className="text-sm text-gray-600">Giao diện thân thiện</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Tiết kiệm thời gian</p>
              <p className="text-sm text-gray-600">Học hiệu quả hơn</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <p className="font-semibold text-gray-900">Theo dõi tiến trình</p>
              <p className="text-sm text-gray-600">Báo cáo chi tiết</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalQuestions}</div>
            <div className="text-gray-600">Câu hỏi</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{totalSubjects}</div>
            <div className="text-gray-600">Môn học</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{totalExams}</div>
            <div className="text-gray-600">Đề thi</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.filter(f => f.show).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group cursor-pointer"
                onClick={feature.action}
              >
                <div className={`inline-flex p-3 rounded-lg text-white mb-4 ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {feature.stats}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Bắt đầu học ngay hôm nay</h2>
            <p className="text-blue-100 mb-6">
              Tham gia hàng nghìn người đang sử dụng QuizMaster để nâng cao kiến thức
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '#flashcard'}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Học Flashcard
              </button>
              <button 
                onClick={() => window.location.href = '#quiz'}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Làm Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;