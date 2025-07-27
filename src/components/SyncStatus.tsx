import React from 'react';
import { Cloud, CloudOff, RefreshCw, User, LogOut, LogIn, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncStatusProps {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onSyncToCloud: () => void;
  onSyncFromCloud: () => void;
  user: any;
}

const SyncStatus: React.FC<SyncStatusProps> = ({
  isConnected,
  isSyncing,
  lastSyncTime,
  onSignIn,
  onSignOut,
  onSyncToCloud,
  onSyncFromCloud,
  user
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Đồng bộ dữ liệu</h3>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-1 text-green-600">
              <Cloud className="h-4 w-4" />
              <span className="text-sm">Đã kết nối</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-gray-500">
              <CloudOff className="h-4 w-4" />
              <span className="text-sm">Chưa kết nối</span>
            </div>
          )}
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-3">
          {/* User info */}
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              ID: {user?.uid?.substring(0, 8)}...
            </span>
          </div>

          {/* Last sync time */}
          {lastSyncTime && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600">
                Đồng bộ lần cuối: {formatTime(lastSyncTime)}
              </span>
            </div>
          )}

          {/* Sync buttons */}
          <div className="flex space-x-2">
            <button
              onClick={onSyncToCloud}
              disabled={isSyncing}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm rounded flex items-center justify-center space-x-1 transition-colors duration-200"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              <span>Đồng bộ lên</span>
            </button>
            
            <button
              onClick={onSyncFromCloud}
              disabled={isSyncing}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm rounded flex items-center justify-center space-x-1 transition-colors duration-200"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              <span>Tải về</span>
            </button>
          </div>

          {/* Sign out button */}
          <button
            onClick={onSignOut}
            className="w-full px-3 py-2 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded flex items-center justify-center space-x-1 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-600">
              Dữ liệu chỉ lưu cục bộ
            </span>
          </div>

          <button
            onClick={onSignIn}
            disabled={isSyncing}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded flex items-center justify-center space-x-1 transition-colors duration-200"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span>Đăng nhập để đồng bộ</span>
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <p>• Dữ liệu sẽ được đồng bộ tự động khi có thay đổi</p>
        <p>• Bạn có thể truy cập từ thiết bị khác sau khi đăng nhập</p>
        <p>• Dữ liệu được mã hóa và bảo mật</p>
      </div>
    </div>
  );
};

export default SyncStatus; 