import React, { useState } from 'react';
import { User as UserIcon, UserCheck, UserX, Crown, LogOut as LogOutIcon, Sparkles, Zap } from 'lucide-react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserPlan } from '../hooks/useUserPlan';
import { UserAuth } from './UserAuth';

interface UserStatusProps {
  user: User | null;
  userRole: string;
  onSignOut: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const UserStatus: React.FC<UserStatusProps> = ({ user, userRole, onSignOut, showToast }) => {
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { signInAnonymously } = useAuth();
  const navigate = useNavigate();
  const { userPlan, getPlanDisplay, getPlanColor, isBasic } = useUserPlan({ user });

  const handleUserAuthSuccess = (user: User) => {
    console.log('[UserStatus] User auth successful:', user.email);
    setShowUserAuth(false);
  };

  const getPlanIcon = () => {
    if (userRole === 'admin') return Crown;
    if (userPlan === 'pro') return Sparkles;
    if (userPlan === 'basic') return UserCheck;
    if (user) return UserCheck;
    return UserX;
  };

  const PlanIcon = getPlanIcon();

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };

  const handleUpgradeToPro = () => {
    // In real app, this would integrate with payment system
    showToast('Tính năng upgrade đang được phát triển!', 'success');
    setShowUpgradeModal(false);
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* Professional User Info */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium border ${getPlanColor()} flex items-center space-x-1`}>
          <PlanIcon className="h-3 w-3" />
          <span className="hidden xs:inline">{getPlanDisplay()}</span>
        </div>
        {user && (
          <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">
            {user.displayName || user.email || 'Khách'}
          </span>
        )}
      </div>

      {/* Professional Action Buttons */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {user ? (
          // Logged in user
          <div className="flex items-center space-x-1 sm:space-x-2">
            {isBasic && (
              <button
                onClick={() => navigate('/upgrade')}
                className="bg-white text-orange-600 border border-orange-200 hover:border-orange-300 hover:bg-orange-50 px-3 py-1.5 rounded-full font-medium text-xs transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-1.5 shadow-sm"
                title="Nâng cấp gói của bạn ngay!"
              >
                <span className="hidden sm:inline">Nâng cấp gói của bạn ngay!</span>
              </button>
            )}
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
              title="Đăng xuất"
            >
              <LogOutIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        ) : (
          // Guest user
          <button
            onClick={handleAuthClick}
            className="flex items-center space-x-1 px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            title="Đăng nhập / Đăng ký"
          >
            <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </button>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nâng cấp gói của bạn ngay!</h3>
                <p className="text-gray-600 mb-6">
                  Nâng cấp lên Pro để truy cập tất cả đề thi và tính năng cao cấp!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/upgrade')}
                    className="w-full bg-white text-orange-600 border border-orange-200 hover:border-orange-300 hover:bg-orange-50 py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-sm"
                  >
                    Nâng cấp gói của bạn ngay!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Auth Modal - Keep for backward compatibility */}
      <UserAuth
        isOpen={showUserAuth}
        onClose={() => setShowUserAuth(false)}
        onSuccess={handleUserAuthSuccess}
        onAnonymousSignIn={signInAnonymously}
        showSuccessMessage={showToast}
      />
    </div>
  );
};

export default UserStatus; 