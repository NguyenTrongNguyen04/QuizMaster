import React from 'react';
import { BookOpen, Brain, Trophy, Settings, ArrowRight, Users, Clock, Target, Shield, Zap, TrendingUp } from 'lucide-react';
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
      title: 'Quản lý nội dung',
      description: 'Hệ thống quản lý câu hỏi và đề thi chuyên nghiệp',
      action: () => window.location.href = '#manage',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stats: `${totalQuestions} câu hỏi`,
      show: userRole === 'admin'
    },
    {
      icon: BookOpen,
      title: 'Học tập thông minh',
      description: 'Phương pháp học tập hiệu quả với flashcard tương tác',
      action: () => window.location.href = '#flashcard',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      stats: 'Học tương tác',
      show: true
    },
    {
      icon: Brain,
      title: 'Kiểm tra đánh giá',
      description: 'Hệ thống kiểm tra và đánh giá kiến thức toàn diện',
      action: () => window.location.href = '#quiz',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      stats: 'Tự động chấm điểm',
      show: true
    },
    {
      icon: Trophy,
      title: 'Báo cáo tiến độ',
      description: 'Theo dõi và phân tích tiến độ học tập chi tiết',
      action: () => window.location.href = '#results',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      stats: 'Báo cáo chi tiết',
      show: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Professional Logo */}
          <div className="flex justify-center mb-10">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-xl shadow-lg">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              QuizMaster
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Nền tảng học tập trắc nghiệm chuyên nghiệp cho doanh nghiệp. 
            <br className="hidden md:block" />
            Tối ưu hóa quy trình đào tạo và đánh giá nhân viên.
          </p>
          
          {/* Enterprise Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto mb-20">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <p className="font-bold text-gray-900 text-lg mb-3">Bảo mật cao</p>
              <p className="text-gray-600 text-sm leading-relaxed">Hệ thống bảo mật enterprise-grade</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Zap className="h-10 w-10 text-green-600" />
              </div>
              <p className="font-bold text-gray-900 text-lg mb-3">Hiệu suất cao</p>
              <p className="text-gray-600 text-sm leading-relaxed">Tối ưu hóa cho doanh nghiệp lớn</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <TrendingUp className="h-10 w-10 text-purple-600" />
              </div>
              <p className="font-bold text-gray-900 text-lg mb-3">Phân tích dữ liệu</p>
              <p className="text-gray-600 text-sm leading-relaxed">Báo cáo và phân tích chuyên sâu</p>
            </div>
          </div>
        </div>

        {/* Professional Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-4xl font-bold text-blue-600 mb-3">{totalQuestions}</div>
            <div className="text-gray-600 font-medium">Câu hỏi</div>
            <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mt-4"></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-4xl font-bold text-green-600 mb-3">{totalSubjects}</div>
            <div className="text-gray-600 font-medium">Môn học</div>
            <div className="w-12 h-1 bg-green-600 rounded-full mx-auto mt-4"></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="text-4xl font-bold text-purple-600 mb-3">{totalExams}</div>
            <div className="text-gray-600 font-medium">Đề thi</div>
            <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mt-4"></div>
          </div>
        </div>

        {/* Professional Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.filter(f => f.show).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 group cursor-pointer hover:-translate-y-1"
                onClick={feature.action}
              >
                <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
                    {feature.stats}
                  </span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Professional Call to Action */}
        <div className="text-center mt-24">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Bắt đầu sử dụng ngay hôm nay</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Nâng cao hiệu quả đào tạo và đánh giá nhân viên với nền tảng chuyên nghiệp
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => window.location.href = '#flashcard'}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Học tập
              </button>
              <button 
                onClick={() => window.location.href = '#quiz'}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Kiểm tra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;