import React from 'react';
import { Home, BookOpen, FileText, BarChart3, Settings } from 'lucide-react';
import { User } from 'firebase/auth';
import UserStatus from './UserStatus';
import { UserRole } from '../hooks/useAuth';
import logo from '../../assets/logo.jpg';

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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Professional Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group" onClick={() => onPageChange('home')}>
              <img 
                src={logo} 
                alt="FUPlatform Logo" 
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300" 
              />
              <span className="text-lg sm:text-xl font-bold text-[#112f61] group-hover:text-[#e77a15] transition-colors">
                FUPlatform
              </span>
            </div>
          </div>

          {/* Professional Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'bg-[#e77a15]/10 text-[#e77a15] border border-[#e77a15]/20 shadow-sm'
                      : 'text-[#112f61] hover:text-[#e77a15] hover:bg-[#e77a15]/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-[#e77a15] rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Status */}
          <div className="flex items-center">
            <UserStatus user={user} userRole={userRole} onSignOut={onSignOut} showToast={showToast} />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-[#e77a15]/10 text-[#e77a15] border border-[#e77a15]/20 shadow-sm'
                      : 'text-[#112f61] hover:text-[#e77a15] hover:bg-[#e77a15]/5'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-[#e77a15] rounded-full"></div>
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