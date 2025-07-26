import React from 'react';
import { BookOpen, Brain, Trophy, Settings, ArrowRight, Users, Clock, Target } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
  questionsCount: number;
  resultsCount: number;
}

const Home: React.FC<HomeProps> = ({ onNavigate, questionsCount, resultsCount }) => {
  const features = [
    {
      icon: Settings,
      title: 'Quản lý câu hỏi',
      description: 'Thêm, sửa, xóa câu hỏi trắc nghiệm một cách dễ dàng',
      action: () => onNavigate('manage'),
      color: 'bg-blue-500 hover:bg-blue-600',
      stats: `${questionsCount} câu hỏi`
    },
    {
      icon: BookOpen,
      title: 'Học Flashcard',
      description: 'Học và ghi nhớ kiến thức qua hệ thống thẻ ghi nhớ',
      action: () => onNavigate('flashcard'),
      color: 'bg-green-500 hover:bg-green-600',
      stats: 'Học tương tác'
    },
    {
      icon: Brain,
      title: 'Làm Quiz',
      description: 'Kiểm tra kiến thức với các câu hỏi trắc nghiệm ngẫu nhiên',
      action: () => onNavigate('quiz'),
      color: 'bg-purple-500 hover:bg-purple-600',
      stats: 'Tự động chấm điểm'
    },
    {
      icon: Trophy,
      title: 'Xem kết quả',
      description: 'Theo dõi tiến trình học tập và kết quả các bài kiểm tra',
      action: () => onNavigate('results'),
      color: 'bg-orange-500 hover:bg-orange-600',
      stats: `${resultsCount} kết quả`
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

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group cursor-pointer"
                onClick={feature.action}
              >
                <div className={`${feature.color} p-3 rounded-xl inline-block mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{feature.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">{feature.stats}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thống kê nhanh</h2>
            <p className="text-gray-600">Tổng quan về hoạt động học tập của bạn</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">{questionsCount}</p>
              <p className="text-gray-700 font-medium">Câu hỏi có sẵn</p>
              <p className="text-sm text-gray-600 mt-1">Sẵn sàng để học và kiểm tra</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">{resultsCount}</p>
              <p className="text-gray-700 font-medium">Lần làm bài</p>
              <p className="text-sm text-gray-600 mt-1">Kết quả đã được lưu trữ</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        {questionsCount === 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Bắt đầu ngay hôm nay!</h2>
            <p className="mb-6 opacity-90">
              Thêm câu hỏi đầu tiên của bạn để bắt đầu hành trình học tập
            </p>
            <button
              onClick={() => onNavigate('manage')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span>Thêm câu hỏi ngay</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;