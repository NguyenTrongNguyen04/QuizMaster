import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserAuth } from './UserAuth';
import { LogOutIcon, UserIcon, SettingsIcon, Crown, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserStatusProps {
  user: User | null;
  userRole: 'admin' | 'viewer' | null;
  onSignOut: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const UserStatus: React.FC<UserStatusProps> = ({ user, userRole, onSignOut, showToast }) => {
  const [showUserAuth, setShowUserAuth] = useState(false);
  const { signInAnonymously } = useAuth();

  const handleUserAuthSuccess = (user: User) => {
    console.log('[UserStatus] User auth successful:', user.email);
    setShowUserAuth(false);
  };

  const getRoleDisplay = () => {
    if (userRole === 'admin') return 'Quản trị viên';
    if (user) return 'Người dùng';
    return 'Khách';
  };

  const getRoleIcon = () => {
    if (userRole === 'admin') return Crown;
    if (user) return UserCheck;
    return UserX;
  };

  const getRoleColor = () => {
    if (userRole === 'admin') return 'text-red-600 bg-red-50 border-red-200';
    if (user) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="flex items-center space-x-4">
      {/* Professional User Info */}
      <div className="flex items-center space-x-3">
        <div className={`px-3 py-1 rounded-md text-xs font-medium border ${getRoleColor()} flex items-center space-x-1`}>
          <RoleIcon className="h-3 w-3" />
          <span>{getRoleDisplay()}</span>
        </div>
        {user && (
          <span className="text-sm text-gray-700 hidden sm:inline">
            {user.email || 'Khách'}
          </span>
        )}
      </div>

      {/* Professional Action Buttons */}
      <div className="flex items-center space-x-2">
        {user ? (
          // Logged in user
          <div className="flex items-center space-x-2">
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
              title="Đăng xuất"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        ) : (
          // Guest user
          <button
            onClick={() => setShowUserAuth(true)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            title="Đăng nhập / Đăng ký"
          >
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </button>
        )}
      </div>

      {/* User Auth Modal */}
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