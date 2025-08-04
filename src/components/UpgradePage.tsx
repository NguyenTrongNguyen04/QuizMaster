import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, ArrowLeft, Crown, Star, Zap, Shield, Users, BarChart3, Gem, ArrowUpRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, amount: number} | null>(null);

  useEffect(() => {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Trigger animations after loading
    const animationTimer = setTimeout(() => setIsLoaded(true), 100);
    
    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(animationTimer);
    };
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleUpgradeToPro = () => {
    setSelectedPlan({ name: 'Pro', amount: 19000 });
    setShowPaymentModal(true);
  };

  const handleUpgradeToPremium = () => {
    setSelectedPlan({ name: 'Premium', amount: 29000 });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    // In real app, update user plan in database
    alert(`Thanh toán thành công! Transaction ID: ${transactionId}`);
    // Update user plan to Pro/Premium
    // navigate('/dashboard');
  };

  const handlePaymentError = (error: string) => {
    alert(`Lỗi thanh toán: ${error}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải trang nâng cấp gói của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className={`mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-110 hover:rotate-12"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 flex-1 text-center">
              Simple Pricing for <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">Powerful</span> Learning
            </h1>
            
            <div className="w-6"></div> {/* Spacer to balance the layout */}
          </div>

          {/* Billing Toggle */}
          <div className="flex flex-col items-center space-y-2 mb-8">
            <div className="bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex relative">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-8 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    !isYearly 
                      ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                      : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-8 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isYearly 
                      ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                      : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Năm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Standard Plan */}
          <div className={`relative bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-all duration-700 overflow-hidden h-full transform hover:scale-105 hover:-translate-y-2 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '200ms' }}>
            {/* Gradient overlay - only top 1/4 */}
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-blue-100 to-white pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors duration-300">Standard</h3>
                <p className="text-gray-600 mb-4">Hoàn hảo để bắt đầu học tập.</p>
                <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {isYearly ? 'Miễn phí' : 'Miễn phí'}
                  </div>
                  <p className="text-sm text-gray-500">
                    {isYearly ? 'mỗi người dùng/năm' : 'mỗi người dùng/tháng'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isYearly ? 'thanh toán hàng năm' : 'thanh toán hàng tháng'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center space-x-3 group hover:bg-blue-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-blue-700 transition-colors duration-300">Truy cập đề thi Quizlet (Có tính năng Plus)</span>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-blue-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '500ms' }}>
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-blue-700 transition-colors duration-300">Học tập với flashcards</span>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-blue-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '600ms' }}>
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-blue-700 transition-colors duration-300">Làm bài kiểm tra cơ bản</span>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-blue-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '700ms' }}>
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-blue-700 transition-colors duration-300">Hỗ trợ cộng đồng</span>
                </div>
              </div>

              <button className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 mt-auto transform hover:scale-105 hover:shadow-lg animate-fade-in" style={{ animationDelay: '800ms' }}>
                Đang sử dụng
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className={`relative h-full transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '400ms' }}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
              <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
                Phổ Biến Nhất
              </div>
            </div>
            
            <div className="relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-700 overflow-hidden h-full transform hover:scale-105 hover:-translate-y-2">
              {/* Gradient overlay - only top 1/4 */}
              <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-purple-100 to-white pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors duration-300">Pro</h3>
                  <p className="text-gray-600 mb-4">Được thiết kế cho người học cần nhiều sức mạnh và tính năng hơn.</p>
                  <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {isYearly ? '19.000đ' : '19.000đ'}
                    </div>
                    <p className="text-sm text-gray-500">
                      {isYearly ? 'mỗi người dùng/năm' : 'mỗi người dùng/tháng'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isYearly ? 'thanh toán hàng năm' : 'thanh toán hàng tháng'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-center space-x-3 group hover:bg-purple-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '600ms' }}>
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Truy cập tất cả đề thi (PE, FE, Quizlet)</span>
                  </div>
                  <div className="flex items-center space-x-3 group hover:bg-purple-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '700ms' }}>
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Không giới hạn số lần làm bài</span>
                  </div>
                  <div className="flex items-center space-x-3 group hover:bg-purple-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '800ms' }}>
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Xuất báo cáo chi tiết</span>
                  </div>
                  <div className="flex items-center space-x-3 group hover:bg-purple-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '900ms' }}>
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Phiên học tập riêng tư</span>
                  </div>
                  <div className="flex items-center space-x-3 group hover:bg-purple-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '1000ms' }}>
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Xử lý ưu tiên</span>
                  </div>
                  <div className="flex items-center space-x-3 group hover:bg-purple-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '1100ms' }}>
                    <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-700 group-hover:text-purple-700 transition-colors duration-300">Hỗ trợ qua email</span>
                  </div>
                </div>

                <button 
                  onClick={handleUpgradeToPro}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300 mt-auto transform hover:scale-105 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: '1200ms' }}
                >
                  Đăng ký ngay!
                </button>
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className={`relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-700 overflow-hidden h-full transform hover:scale-105 hover:-translate-y-2 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '600ms' }}>
            {/* Gradient overlay - only top 1/4 */}
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-green-100 to-white pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors duration-300">Premium</h3>
                <p className="text-gray-600 mb-4">Được xây dựng cho các nhóm và tổ chức có nhu cầu học tập cao.</p>
                <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {isYearly ? '29.000đ' : '29.000đ'}
                  </div>
                  <p className="text-sm text-gray-500">
                    {isYearly ? 'mỗi người dùng/năm' : 'mỗi người dùng/tháng'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isYearly ? 'thanh toán hàng năm' : 'thanh toán hàng tháng'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center space-x-3 group hover:bg-green-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '800ms' }}>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-green-700 transition-colors duration-300">Phiên học tập không giới hạn</span>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-green-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '900ms' }}>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-green-700 transition-colors duration-300">Quyền sử dụng thương mại</span>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-green-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '1000ms' }}>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-green-700 transition-colors duration-300">Truy cập API</span>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-green-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '1100ms' }}>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-green-700 transition-colors duration-300">Quản lý tài khoản chuyên dụng</span>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-green-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '1200ms' }}>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-green-700 transition-colors duration-300">SLA & Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-green-50 p-2 rounded-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '1300ms' }}>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 group-hover:text-green-700 transition-colors duration-300">Công cụ hợp tác nhóm</span>
                </div>
              </div>

              <button 
                onClick={handleUpgradeToPremium}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 mt-auto transform hover:scale-105 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: '1400ms' }}
              >
                Đăng ký ngay!
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 hover:text-blue-600 transition-colors duration-300">
            Câu trả lời cho các câu hỏi thường gặp về Nền tảng Học tập của chúng tôi
          </h2>
        </div>
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          planName={selectedPlan.name}
          amount={selectedPlan.amount}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default UpgradePage; 