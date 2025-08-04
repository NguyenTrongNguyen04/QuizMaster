import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, UserCheck, Shield, X, Loader2 } from 'lucide-react';
import { User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

interface UserAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: FirebaseUser) => void;
  onAnonymousSignIn: () => Promise<FirebaseUser>;
  showSuccessMessage?: (message: string) => void;
}

export const UserAuth: React.FC<UserAuthProps> = ({ isOpen, onClose, onSuccess, onAnonymousSignIn, showSuccessMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anonymousLoading, setAnonymousLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  // Debug log
  // console.log('[UserAuth] isOpen:', isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signIn(email, password);
        console.log(`[UserAuth] Login successful:`, userCredential.email);
        showSuccessMessage?.('Đăng nhập thành công!');
        onSuccess(userCredential);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`[UserAuth] Register successful:`, userCredential.user.email);
        showSuccessMessage?.('Đăng ký thành công!');
        onSuccess(userCredential.user);
      }
      
      resetForm();
    } catch (error: any) {
      console.error(`[UserAuth] ${isLogin ? 'Login' : 'Register'} error:`, error);
      setError(error.message || `${isLogin ? 'Đăng nhập' : 'Đăng ký'} thất bại`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setAnonymousLoading(true);
    setError('');

    try {
      const user = await onAnonymousSignIn();
      console.log('[UserAuth] Anonymous sign in successful');
      showSuccessMessage?.('Đăng nhập ẩn danh thành công!');
      onSuccess(user);
      resetForm();
    } catch (error: any) {
      console.error('[UserAuth] Anonymous sign in error:', error);
      setError('Đăng nhập ẩn danh thất bại');
    } finally {
      setAnonymousLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm mx-auto transform transition-all duration-300 scale-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Anonymous Sign In Button */}
          <button
            type="button"
            onClick={handleAnonymousSignIn}
            disabled={anonymousLoading}
            className="w-full flex justify-center items-center space-x-2 py-2.5 px-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {anonymousLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Đang đăng nhập...</span>
              </div>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                <span className="text-sm">Tiếp tục với tư cách khách</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="text-sm">{isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}</span>
              </>
            ) : (
              <span className="text-sm">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</span>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};