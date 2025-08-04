import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Trophy, Settings, ArrowRight, Users, Clock, Target, Shield, Zap, TrendingUp, Plus } from 'lucide-react';
import { UserRole } from '../hooks/useAuth';
import { UserProfile as UserProfileType, UserStats } from '../hooks/useUserData';
import UserProfile from './UserProfile';
import { createSampleAdmin, debugAdminStatus, createSampleMajors, createSampleSubjects, createSampleExams } from '../config/firebase';
import logo from '../../assets/logo.jpg';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  totalQuestions: number;
  totalSubjects: number;
  totalExams: number;
  userRole: UserRole;
  userProfile?: UserProfileType | null;
  userStats?: UserStats | null;
  userDataLoading?: boolean;
}

const Home: React.FC<HomeProps> = ({ 
  totalQuestions, 
  totalSubjects, 
  totalExams, 
  userRole,
  userProfile,
  userStats,
  userDataLoading = false
}) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateSampleData = async () => {
    try {
      await createSampleMajors();
      await createSampleSubjects();
      await createSampleExams();
      alert('Dữ liệu mẫu đã được tạo thành công!');
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Lỗi khi tạo dữ liệu mẫu');
    }
  };

  const features = [
    {
      icon: Settings,
      title: 'Quản lý nội dung',
      description: 'Hệ thống quản lý chuyên ngành, môn học và đề thi chuyên nghiệp',
      action: () => navigate('/manage'),
      color: 'text-[#e77a15]',
      bgColor: 'bg-[#e77a15]/10',
      stats: `${totalQuestions} câu hỏi`,
      show: userRole === 'admin'
    },
    {
      icon: Plus,
      title: 'Tạo dữ liệu mẫu',
      description: 'Tạo dữ liệu mẫu cho chuyên ngành, môn học và đề thi',
      action: handleCreateSampleData,
      color: 'text-[#112f61]',
      bgColor: 'bg-[#112f61]/10',
      stats: 'Dữ liệu mẫu',
      show: userRole === 'admin'
    },
    {
      icon: Shield,
      title: 'Tạo Admin mẫu',
      description: 'Tạo quyền admin cho tài khoản hiện tại để test',
      action: () => {
        if (userProfile?.email) {
          createSampleAdmin(userProfile.email).then(() => {
            alert('Admin created! Please refresh the page.');
            window.location.reload();
          });
        }
      },
      color: 'text-[#112f61]',
      bgColor: 'bg-[#112f61]/10',
      stats: 'Quyền admin',
      show: userRole !== 'admin' && userProfile?.email
    },
    {
      icon: Zap,
      title: 'Debug Admin Status',
      description: 'Kiểm tra trạng thái admin trong console',
      action: () => {
        if (userProfile?.email) {
          debugAdminStatus(userProfile.email).then((isAdmin) => {
            console.log('Debug result:', isAdmin);
            alert(`Admin check result: ${isAdmin ? 'ADMIN' : 'NOT ADMIN'}\nCheck console for details.`);
          });
        }
      },
      color: 'text-[#e77a15]',
      bgColor: 'bg-[#e77a15]/10',
      stats: 'Debug',
      show: userProfile?.email
    },
    {
      icon: BookOpen,
      title: 'Học tập thông minh',
      description: 'Phương pháp học tập hiệu quả với flashcard tương tác',
      action: () => navigate('/learn'),
      color: 'text-[#112f61]',
      bgColor: 'bg-[#112f61]/10',
      stats: 'Học tương tác',
      show: true
    },
    {
      icon: Brain,
      title: 'Kiểm tra đánh giá',
      description: 'Hệ thống kiểm tra và đánh giá kiến thức toàn diện',
      action: () => navigate('/quiz'),
      color: 'text-[#e77a15]',
      bgColor: 'bg-[#e77a15]/10',
      stats: 'Tự động chấm điểm',
      show: true
    },
    {
      icon: Trophy,
      title: 'Báo cáo tiến độ',
      description: 'Theo dõi và phân tích tiến độ học tập chi tiết',
      action: () => navigate('/results'),
      color: 'text-[#112f61]',
      bgColor: 'bg-[#112f61]/10',
      stats: 'Báo cáo chi tiết',
      show: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20">
        <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Professional Logo */}
          <div className="flex justify-center mb-10">
            <img 
              src={logo} 
              alt="FUPlatform Logo" 
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl shadow-lg hover:scale-110 transition-transform duration-300" 
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
            <span className="text-[#e77a15] hover:text-[#e77a15]/80 transition-colors duration-300">FU</span>
            <span className="text-[#112f61] hover:text-[#112f61]/80 transition-colors duration-300">Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Nền tảng học tập trắc nghiệm chuyên nghiệp cho sinh viên FPT University. 
            <br className="hidden md:block" />
            Tối ưu hóa quy trình học tập và đánh giá kiến thức.
          </p>
        </div>

        {/* User Profile Section - Only show if user is logged in */}
        {userProfile && (
          <div className={`mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            <UserProfile 
              userProfile={userProfile}
              userStats={userStats || null}
              loading={userDataLoading}
            />
          </div>
        )}

        {/* Professional Stats Section */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div className="text-4xl font-bold text-[#e77a15] mb-3 animate-fade-in" style={{ animationDelay: '600ms' }}>{totalQuestions}</div>
            <div className="text-gray-600 font-medium">Câu hỏi</div>
            <div className="w-12 h-1 bg-[#e77a15] rounded-full mx-auto mt-4 animate-fade-in" style={{ animationDelay: '700ms' }}></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div className="text-4xl font-bold text-[#112f61] mb-3 animate-fade-in" style={{ animationDelay: '800ms' }}>{totalSubjects}</div>
            <div className="text-gray-600 font-medium">Môn học</div>
            <div className="w-12 h-1 bg-[#112f61] rounded-full mx-auto mt-4 animate-fade-in" style={{ animationDelay: '900ms' }}></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div className="text-4xl font-bold text-[#e77a15] mb-3 animate-fade-in" style={{ animationDelay: '1000ms' }}>{totalExams}</div>
            <div className="text-gray-600 font-medium">Đề thi</div>
            <div className="w-12 h-1 bg-[#e77a15] rounded-full mx-auto mt-4 animate-fade-in" style={{ animationDelay: '1100ms' }}></div>
          </div>
        </div>

        {/* Professional Feature Cards */}
        <div className={`flex flex-wrap justify-center gap-6 mt-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
          {features.filter(f => f.show).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 p-8 group cursor-pointer hover:-translate-y-2 transform animate-fade-in w-full md:w-80 lg:w-72"
                style={{ animationDelay: `${800 + index * 100}ms` }}
                onClick={feature.action}
              >
                <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#e77a15] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-full group-hover:bg-[#e77a15] group-hover:text-white transition-all duration-300">
                    {feature.stats}
                  </span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#e77a15] group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Professional Call to Action */}
        <div className={`text-center mt-24 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-12 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 hover:text-[#e77a15] transition-colors duration-300">Bắt đầu sử dụng ngay hôm nay</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Nâng cao kiến thức và kỹ năng học tập với nền tảng chuyên nghiệp
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/learn')}
                className="bg-[#e77a15] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#e77a15]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Học tập
              </button>
              <button 
                onClick={() => navigate('/quiz')}
                className="border-2 border-[#112f61] text-[#112f61] px-8 py-4 rounded-xl font-semibold hover:bg-[#112f61] hover:text-white transition-all duration-300 transform hover:scale-105"
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