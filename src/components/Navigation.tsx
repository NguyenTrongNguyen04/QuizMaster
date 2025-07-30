import React from 'react';
import { Home, BookOpen, FileText, BarChart3, RefreshCw, Settings } from 'lucide-react';
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
    { id: 'flashcard', label: 'Flashcard', icon: BookOpen },
    { id: 'quiz', label: 'Kiểm tra', icon: FileText },
    { id: 'results', label: 'Kết quả', icon: BarChart3 },
    { id: 'sync', label: 'Đồng bộ', icon: RefreshCw },
  ];

  // Add manage tab only for admin users
  if (userRole === 'admin') {
    navItems.push({ id: 'manage', label: 'Quản lý', icon: Settings });
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">QuizMaster</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
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
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.label}</span>
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