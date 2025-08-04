import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { vnpayService, VNPayPaymentResponse } from '../services/vnpayService';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handlePaymentCallback = () => {
      try {
        // Extract VNPay response parameters
        const responseData: VNPayPaymentResponse = {
          vnp_ResponseCode: searchParams.get('vnp_ResponseCode') || '',
          vnp_OrderInfo: searchParams.get('vnp_OrderInfo') || '',
          vnp_OrderId: searchParams.get('vnp_OrderId') || '',
          vnp_Amount: searchParams.get('vnp_Amount') || '',
          vnp_TransactionNo: searchParams.get('vnp_TransactionNo') || '',
          vnp_TransactionDate: searchParams.get('vnp_TransactionDate') || '',
          vnp_SecureHash: searchParams.get('vnp_SecureHash') || '',
        };

        // Verify payment response
        const isValid = vnpayService.verifyPaymentResponse(responseData);
        
        if (!isValid) {
          setPaymentStatus('failed');
          setMessage('Chữ ký không hợp lệ. Giao dịch có thể bị giả mạo.');
          return;
        }

        // Check payment status
        const isSuccessful = vnpayService.isPaymentSuccessful(responseData);
        
        if (isSuccessful) {
          setPaymentStatus('success');
          setMessage('Thanh toán thành công! Gói của bạn đã được kích hoạt.');
          
          // In real app, update user plan in database
          // updateUserPlan('pro');
          
        } else {
          setPaymentStatus('failed');
          const statusMessage = vnpayService.getPaymentStatusMessage(responseData.vnp_ResponseCode);
          setMessage(statusMessage);
        }

      } catch (error) {
        console.error('Payment callback error:', error);
        setPaymentStatus('failed');
        setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán.');
      } finally {
        setIsLoading(false);
      }
    };

    handlePaymentCallback();
  }, [searchParams]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    navigate('/upgrade');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-110 hover:rotate-12 mb-6"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Về trang chủ
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Kết quả thanh toán
            </h1>
          </div>

          {/* Payment Status */}
          <div className="text-center mb-8">
            {paymentStatus === 'success' && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            )}
            
            {paymentStatus === 'failed' && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            )}
            
            {paymentStatus === 'pending' && (
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-yellow-600" />
              </div>
            )}

            <h2 className={`text-2xl font-bold mb-4 ${
              paymentStatus === 'success' ? 'text-green-600' :
              paymentStatus === 'failed' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {paymentStatus === 'success' && 'Thanh toán thành công!'}
              {paymentStatus === 'failed' && 'Thanh toán thất bại'}
              {paymentStatus === 'pending' && 'Đang xử lý'}
            </h2>

            <p className="text-gray-600 text-lg mb-6">
              {message}
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Chi tiết giao dịch</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-medium">{searchParams.get('vnp_TransactionNo') || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">{searchParams.get('vnp_OrderId') || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-medium">
                  {searchParams.get('vnp_Amount') 
                    ? `${(parseInt(searchParams.get('vnp_Amount') || '0') / 100).toLocaleString('vi-VN')}đ`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-medium">
                  {searchParams.get('vnp_TransactionDate') 
                    ? new Date(searchParams.get('vnp_TransactionDate') || '').toLocaleString('vi-VN')
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleBackToHome}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              Về trang chủ
            </button>
            
            {paymentStatus === 'failed' && (
              <button
                onClick={handleRetryPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
              >
                Thử lại thanh toán
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback; 