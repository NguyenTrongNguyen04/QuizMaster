import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, UserCheck, Shield, Loader2, Brain, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { User as FirebaseUser, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anonymousLoading, setAnonymousLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const { signIn, signInAnonymously } = useAuth();
  const { createUserProfile } = useUserData(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signIn(email, password);
        console.log(`[AuthPage] Login successful:`, userCredential.email);
        navigate('/');
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`[AuthPage] Register successful:`, userCredential.user.email);
        
        // Cập nhật display name cho user mới
        if (fullName.trim()) {
          try {
            await updateProfile(userCredential.user, {
              displayName: fullName.trim()
            });
            console.log('[AuthPage] Display name updated:', fullName.trim());
          } catch (profileError: any) {
            console.error('[AuthPage] Error updating display name:', profileError);
            // Không throw error vì user đã đăng ký thành công
          }
        }
        
        // Tạo user profile trong database
        try {
          await createUserProfile(userCredential.user);
          console.log('[AuthPage] User profile created successfully');
        } catch (profileError: any) {
          console.error('[AuthPage] Error creating user profile:', profileError);
          // Không throw error vì user đã đăng ký thành công
        }
        
        // Gửi email xác thực sau khi đăng ký
        try {
          await sendEmailVerification(userCredential.user);
          setShowVerificationMessage(true);
          setSuccess('Tài khoản đã được tạo! Vui lòng kiểm tra email để xác thực tài khoản.');
          console.log('[AuthPage] Verification email sent');
        } catch (verificationError: any) {
          console.error('[AuthPage] Error sending verification email:', verificationError);
          // Không throw error vì user đã đăng ký thành công
        }
        
        // KHÔNG navigate ngay, để user thấy thông báo xác thực
        // navigate('/');
      }
    } catch (error: any) {
      console.error(`[AuthPage] ${isLogin ? 'Login' : 'Register'} error:`, error);
      
      // Hiển thị thông báo lỗi thân thiện thay vì lỗi kỹ thuật
      if (error.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.');
      } else if (error.code === 'auth/user-not-found') {
        setError('Email không tồn tại. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Mật khẩu không đúng. Vui lòng kiểm tra lại.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email không hợp lệ. Vui lòng nhập email đúng định dạng.');
      } else if (error.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.');
      } else {
        setError(`${isLogin ? 'Đăng nhập' : 'Đăng ký'} thất bại. Vui lòng thử lại.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    setSuccess('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('[AuthPage] Google sign in successful:', result.user.email);
      
      // Tạo user profile nếu chưa có
      try {
        await createUserProfile(result.user);
        console.log('[AuthPage] User profile created/updated for Google sign in');
      } catch (profileError: any) {
        console.error('[AuthPage] Error creating user profile for Google sign in:', profileError);
      }
      
      navigate('/');
    } catch (error: any) {
      console.error('[AuthPage] Google sign in error:', error);
      
      // Hiển thị thông báo lỗi thân thiện
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Đăng nhập bị hủy. Vui lòng thử lại.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError('Email này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng email/password.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.');
      } else {
        setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setAnonymousLoading(true);
    setError('');
    setSuccess('');

    try {
      const anonymousUser = await signInAnonymously();
      console.log('[AuthPage] Anonymous sign in successful');
      
      // Tạo user profile cho anonymous user
      try {
        await createUserProfile(anonymousUser);
        console.log('[AuthPage] User profile created for anonymous user');
      } catch (profileError: any) {
        console.error('[AuthPage] Error creating user profile for anonymous user:', profileError);
      }
      
      navigate('/');
    } catch (error: any) {
      console.error('[AuthPage] Anonymous sign in error:', error);
      
      // Hiển thị thông báo lỗi thân thiện
      if (error.code === 'auth/operation-not-allowed') {
        setError('Đăng nhập ẩn danh không được bật. Vui lòng liên hệ quản trị viên.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.');
      } else {
        setError('Đăng nhập ẩn danh thất bại. Vui lòng thử lại.');
      }
    } finally {
      setAnonymousLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập email của bạn');
      return;
    }

    setResetLoading(true);
    setError('');
    setSuccess('');

    try {
      // Để Firebase tự xử lý việc kiểm tra email tồn tại
      console.log('[AuthPage] Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      setSuccess('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
      // KHÔNG reset form và KHÔNG chuyển về form đăng nhập
      // Chỉ clear loading state
    } catch (error: any) {
      console.error('[AuthPage] Password reset error:', error);
      // Kiểm tra loại lỗi để hiển thị thông báo phù hợp
      if (error.code === 'auth/user-not-found') {
        setError('Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email không hợp lệ. Vui lòng nhập email đúng định dạng.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.');
      } else {
        setError('Không thể gửi email đặt lại mật khẩu. Vui lòng kiểm tra email và thử lại.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setShowPassword(false);
    setError('');
    setSuccess('');
    setShowResetForm(false);
    setShowVerificationMessage(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setShowVerificationMessage(false);
    resetForm();
  };

  const handleForgotPassword = () => {
    setShowResetForm(true);
    setError('');
    setSuccess('');
    // KHÔNG reset email field để user không phải nhập lại
  };

  const handleBackToLogin = () => {
    setShowResetForm(false);
    setError('');
    setSuccess('');
    // KHÔNG reset email field để user có thể dùng lại
  };

  const handleContinueToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="FUPlatform Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl shadow-lg" 
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FUPlatform</h1>
          <p className="text-gray-600">
            {showResetForm 
              ? 'Đặt lại mật khẩu' 
              : isLogin 
                ? 'Đăng nhập vào tài khoản' 
                : 'Tạo tài khoản mới'
            }
          </p>
        </div>

        {/* Auth Card */}
        <div className={`bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 ${isLogin ? 'border-[#e77a15]/20' : 'border-[#112f61]/20'}`}>
          {showVerificationMessage ? (
            <>
              {/* Email Verification Message */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Kiểm tra email của bạn</h3>
                <p className="text-sm text-gray-600">
                  Chúng tôi đã gửi email xác thực đến <span className="font-medium text-gray-900">{email}</span>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Email có thể nằm trong thư mục Spam/Junk. 
                    Vui lòng kiểm tra và click vào link xác thực trong email.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleContinueToHome}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#e77a15] to-[#e77a15]/90 text-white rounded-xl hover:from-[#e77a15]/90 hover:to-[#e77a15] focus:outline-none focus:ring-2 focus:ring-[#e77a15] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm font-medium"
                  >
                    Tiếp tục đến trang chủ
                  </button>
                  <button
                    onClick={() => setShowVerificationMessage(false)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e77a15] focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </div>
            </>
          ) : !showResetForm ? (
            <>
              {/* Mode Indicator */}
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gray-100 rounded-xl p-1 flex relative">
                  {/* Animated Background Slider */}
                  <div 
                    className={`absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${
                      isLogin 
                        ? 'left-1 w-[calc(50%-0.125rem)]' 
                        : 'right-1 w-[calc(50%-0.125rem)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out z-10 focus:outline-none ${
                      isLogin 
                        ? 'text-[#e77a15] transform scale-105' 
                        : 'text-gray-600 hover:text-gray-800 transform scale-100'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out z-10 focus:outline-none ${
                      !isLogin 
                        ? 'text-[#112f61] transform scale-105' 
                        : 'text-gray-600 hover:text-gray-800 transform scale-100'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>
              </div>

              {/* Form Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 transition-all duration-300 ease-in-out ${
                  isLogin ? 'bg-[#e77a15]/10' : 'bg-[#112f61]/10'
                }`}>
                  {isLogin ? (
                    <UserCheck className={`h-6 w-6 transition-all duration-300 ease-in-out ${isLogin ? 'text-[#e77a15]' : 'text-[#112f61]'}`} />
                  ) : (
                    <User className={`h-6 w-6 transition-all duration-300 ease-in-out ${isLogin ? 'text-[#e77a15]' : 'text-[#112f61]'}`} />
                  )}
                </div>
                <h2 className={`text-xl font-bold transition-all duration-300 ease-in-out ${isLogin ? 'text-[#e77a15]' : 'text-[#112f61]'}`}>
                  {isLogin ? 'Chào mừng bạn trở lại!' : 'Tạo tài khoản mới'}
                </h2>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full flex justify-center items-center space-x-3 py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e77a15] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {googleLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Đang đăng nhập...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-sm">Tiếp tục với Google</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAnonymousSignIn}
                  disabled={anonymousLoading}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e77a15] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e77a15] focus:border-[#e77a15] transition-all duration-200 text-sm"
                      placeholder="Nhập email của bạn"
                      required
                    />
                  </div>
                </div>

                {/* Họ và tên - chỉ hiển thị khi đăng ký */}
                {!isLogin && (
                  <div className="space-y-1">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#112f61] focus:border-[#112f61] transition-all duration-200 text-sm"
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e77a15] focus:border-[#e77a15] transition-all duration-200 text-sm"
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

                {/* Forgot Password Link - Only show for login */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-[#e77a15] hover:text-[#e77a15]/80 font-medium transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r text-white rounded-xl hover:from-[#e77a15]/90 hover:to-[#e77a15] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm font-medium ${
                    isLogin 
                      ? 'from-[#e77a15] to-[#e77a15]/90 focus:ring-[#e77a15]' 
                      : 'from-[#112f61] to-[#112f61]/90 focus:ring-[#112f61]'
                  }`}
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
                    className={`text-sm font-medium transition-colors ${
                      isLogin 
                        ? 'text-[#112f61] hover:text-[#112f61]/80' 
                        : 'text-[#e77a15] hover:text-[#e77a15]/80'
                    }`}
                  >
                    {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập ngay'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Password Reset Form */}
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="reset-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e77a15] focus:border-[#e77a15] transition-all duration-200 text-sm"
                      placeholder="Nhập email của bạn"
                      required
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Chúng tôi sẽ gửi email hướng dẫn đặt lại mật khẩu đến địa chỉ email của bạn.
                </p>

                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#e77a15] to-[#e77a15]/90 text-white rounded-xl hover:from-[#e77a15]/90 hover:to-[#e77a15] focus:outline-none focus:ring-2 focus:ring-[#e77a15] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm font-medium"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Đang gửi email...</span>
                    </>
                  ) : (
                    <span className="text-sm">Gửi email đặt lại mật khẩu</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-[#e77a15] hover:text-[#e77a15]/80 font-medium transition-colors"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Quay lại trang chủ</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-[#e77a15]" />
              <span className="text-sm font-medium text-gray-900">Bảo mật cao</span>
            </div>
            <p className="text-xs text-gray-600">
              Dữ liệu của bạn được mã hóa và bảo vệ an toàn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 