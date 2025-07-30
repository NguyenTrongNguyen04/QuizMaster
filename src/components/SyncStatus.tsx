import React from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SyncStatusProps {
  isConnected: boolean;
  lastSyncTime: Date | null;
  onSyncToCloud: () => void;
  onSyncFromCloud: () => void;
  user: any;
  userRole: string | null;
}

const SyncStatus: React.FC<SyncStatusProps> = ({
  isConnected,
  lastSyncTime,
  onSyncToCloud,
  onSyncFromCloud,
  user,
  userRole
}) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Chưa đồng bộ';
    return date.toLocaleString('vi-VN');
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: 'Đã kết nối',
        color: 'text-green-600'
      };
    } else {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: 'Chưa kết nối',
        color: 'text-red-600'
      };
    }
  };

  const getRoleDisplay = (role: string | null) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', icon: User, color: 'text-red-600' };
      case 'viewer':
        return { label: 'Viewer', icon: User, color: 'text-blue-600' };
      default:
        return { label: 'Khách', icon: User, color: 'text-gray-600' };
    }
  };

  const connectionStatus = getConnectionStatus();
  const roleInfo = getRoleDisplay(userRole);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Trạng thái đồng bộ</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết nối</h3>
          <div className="flex items-center space-x-3 mb-4">
            {connectionStatus.icon}
            <span className={`font-medium ${connectionStatus.color}`}>
              {connectionStatus.text}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Lần đồng bộ cuối: {formatLastSync(lastSyncTime)}
            </span>
          </div>
        </div>

        {/* User Status */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Người dùng</h3>
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <roleInfo.icon className="h-5 w-5" />
                <span className={`font-medium ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {user.email}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <XCircle className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Chưa đăng nhập
            </div>
          )}
        </div>
      </div>

      {/* Sync Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSyncToCloud}
          disabled={!isConnected}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Đồng bộ lên cloud</span>
        </button>
        
        <button
          onClick={onSyncFromCloud}
          disabled={!isConnected}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Đồng bộ từ cloud</span>
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Thông tin đồng bộ</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Dữ liệu được đồng bộ tự động khi có thay đổi</li>
          <li>• Chỉ admin mới có thể quản lý nội dung công khai</li>
          <li>• Dữ liệu cá nhân được lưu riêng cho từng người dùng</li>
          <li>• Kết nối Firebase Realtime Database để đồng bộ real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default SyncStatus; 