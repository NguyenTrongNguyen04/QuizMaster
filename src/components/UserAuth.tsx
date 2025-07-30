import React, { useState } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, UserCheckIcon } from 'lucide-react';

interface UserAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onAnonymousSignIn: () => Promise<User>;
  showSuccessMessage?: (message: string) => void;
}

export const UserAuth: React.FC<UserAuthProps> = ({ isOpen, onClose, onSuccess, onAnonymousSignIn, showSuccessMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setIsLoading(false);
        return;
      }

      let userCredential: any;
      
      if (isLogin) {
        // Đăng nhập
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log(`[UserAuth] Login successful:`, userCredential.user.email);
        showSuccessMessage?.('Đăng nhập thành công!');
      } else {
        // Đăng ký
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`[UserAuth] Register successful:`, userCredential.user.email);
        showSuccessMessage?.('Đăng ký thành công!');
      }

      onSuccess(userCredential.user);
      onClose();
    } catch (error: any) {
      console.error(`[UserAuth] ${isLogin ? 'Login' : 'Register'} error:`, error);
      
      let errorMessage = '';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Tài khoản không tồn tại';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không đúng';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu (cần ít nhất 6 ký tự)';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email đã được sử dụng';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau';
          break;
        default:
          errorMessage = `Đăng ${isLogin ? 'nhập' : 'ký'} thất bại: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setError('');
    setIsAnonymousLoading(true);

    try {
      const user = await onAnonymousSignIn();
      console.log('[UserAuth] Anonymous sign in successful');
      showSuccessMessage?.('Đăng nhập ẩn danh thành công!');
      onSuccess(user);
      onClose();
    } catch (error: any) {
      console.error('[UserAuth] Anonymous sign in error:', error);
      setError('Đăng nhập ẩn danh thất bại');
    } finally {
      setIsAnonymousLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Anonymous Sign In Button */}
          <button
            onClick={handleAnonymousSignIn}
            disabled={isAnonymousLoading}
            className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isAnonymousLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Đang đăng nhập...
              </div>
            ) : (
              <>
                <UserCheckIcon className="h-4 w-4" />
                <span>Tiếp tục với tư cách khách</span>
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (only for register) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}
                </div>
              ) : (
                isLogin ? 'Đăng nhập' : 'Đăng ký'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              <button
                onClick={toggleMode}
                className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};