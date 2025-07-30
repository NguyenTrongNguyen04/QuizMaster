import React from 'react';
import { Home, BookOpen, FileText, BarChart3, Settings, Brain } from 'lucide-react';
import { User } from 'firebase/auth';
import UserStatus from './UserStatus';
import { UserRole } from '../hooks/useAuth';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: User | null;
  userRole: UserRole;
  onSignOut: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, user, userRole, onSignOut, showToast }) => {
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'flashcard', label: 'Học tập', icon: BookOpen },
    { id: 'quiz', label: 'Kiểm tra', icon: FileText },
    { id: 'results', label: 'Báo cáo', icon: BarChart3 },
  ];

  // Add manage tab only for admin users
  if (userRole === 'admin') {
    navItems.push({ id: 'manage', label: 'Quản lý', icon: Settings });
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Professional Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onPageChange('home')}>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                QuizMaster
              </span>
            </div>
          </div>

          {/* Professional Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Status */}
          <div className="flex items-center space-x-4">
            <UserStatus user={user} userRole={userRole} onSignOut={onSignOut} showToast={showToast} />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex space-x-2 overflow-x-auto pb-3 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;