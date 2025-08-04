import React from 'react';
import { User, Calendar, Clock, Target, TrendingUp, Award, BookOpen, CheckCircle } from 'lucide-react';
import { UserProfile as UserProfileType, UserStats } from '../hooks/useUserData';

interface UserProfileProps {
  userProfile: UserProfileType | null;
  userStats: UserStats | null;
  loading?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ userProfile, userStats, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không có thông tin người dùng</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa có thông tin';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Chưa có thông tin';
      }
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('[UserProfile] Error formatting date:', dateString, error);
      return 'Chưa có thông tin';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {userProfile.displayName || userProfile.email}
            </h2>
            <p className="text-gray-600">{userProfile.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userProfile.role === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {userProfile.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Tham gia:</span>
            <span className="font-medium">{formatDate(userProfile.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Đăng nhập cuối:</span>
            <span className="font-medium">{formatDate(userProfile.lastLogin)}</span>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      {userStats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Thống kê học tập
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-lg mb-2">
                <BookOpen className="h-6 w-6 text-blue-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalQuestions}</p>
              <p className="text-sm text-gray-600">Câu hỏi</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-lg mb-2">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.correctAnswers}</p>
              <p className="text-sm text-gray-600">Đúng</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 p-3 rounded-lg mb-2">
                <Target className="h-6 w-6 text-yellow-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.accuracy}%</p>
              <p className="text-sm text-gray-600">Độ chính xác</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-lg mb-2">
                <Award className="h-6 w-6 text-purple-600 mx-auto" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.averageScore}/10</p>
              <p className="text-sm text-gray-600">Điểm TB</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Thời gian học tập:</span>
              <span className="font-medium">{formatTime(userStats.studyTime)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Card */}
      {userProfile.progress && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ học tập</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Hoàn thành</span>
                <span className="font-medium">
                  {userProfile.progress.correctAnswers}/{userProfile.progress.totalQuestions} câu
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: userProfile.progress.totalQuestions > 0 
                      ? `${(userProfile.progress.correctAnswers / userProfile.progress.totalQuestions) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
            </div>
            
            {userProfile.progress.lastStudyDate && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Học lần cuối: {formatDate(userProfile.progress.lastStudyDate)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 