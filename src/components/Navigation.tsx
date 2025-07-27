import React from 'react';
import { BookOpen, Brain, Trophy, Settings, Home, Cloud } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'manage', label: 'Quản lý', icon: Settings },
    { id: 'flashcard', label: 'Flashcard', icon: BookOpen },
    { id: 'quiz', label: 'Quiz', icon: Brain },
    { id: 'results', label: 'Kết quả', icon: Trophy },
    { id: 'sync', label: 'Đồng bộ', icon: Cloud },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">QuizMaster</span>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:block">{item.label}</span>
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