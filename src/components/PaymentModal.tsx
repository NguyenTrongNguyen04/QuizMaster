import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { vnpayService, VNPayPaymentRequest } from '../services/vnpayService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  planName: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  planName,
  onSuccess,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'vnpay' | 'momo' | 'paypal'>('vnpay');

  const handlePayment = async () => {
    if (selectedMethod === 'vnpay') {
      await handleVNPayPayment();
    } else {
      onError('Phương thức thanh toán này đang được phát triển');
    }
  };

  const handleVNPayPayment = async () => {
    setIsProcessing(true);
    try {
      // Generate unique order ID
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentRequest: VNPayPaymentRequest = {
        amount: amount * 100, // VNPay expects amount in smallest currency unit (cents)
        orderId: orderId,
        orderInfo: `Thanh toán gói ${planName} - FUPlatform`,
        locale: 'vn',
        currency: 'VND',
        ipAddr: '127.0.0.1' // In production, get real IP
      };

      // Create payment URL
      const paymentUrl = vnpayService.createPaymentUrl(paymentRequest);
      
      // Open payment URL in new window
      const paymentWindow = window.open(paymentUrl, '_blank', 'width=800,height=600');
      
      if (!paymentWindow) {
        onError('Không thể mở cửa sổ thanh toán. Vui lòng kiểm tra popup blocker.');
        return;
      }

      // In production, you would handle the callback via webhook or redirect
      // For now, we'll simulate success after a delay
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(orderId);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Payment error:', error);
      onError('Có lỗi xảy ra khi tạo giao dịch thanh toán');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Thanh toán</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Thông tin đơn hàng</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Gói:</span>
                <span className="font-medium">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-bold text-lg text-orange-600">
                  {amount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Chọn phương thức thanh toán</h3>
            <div className="space-y-3">
              {/* VNPay */}
              <button
                onClick={() => setSelectedMethod('vnpay')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                  selectedMethod === 'vnpay'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">VNPay</div>
                  <div className="text-sm text-gray-500">Thẻ ATM, thẻ quốc tế, QR Code</div>
                </div>
                {selectedMethod === 'vnpay' && (
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                )}
              </button>

              {/* Momo */}
              <button
                onClick={() => setSelectedMethod('momo')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                  selectedMethod === 'momo'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-pink-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Momo</div>
                  <div className="text-sm text-gray-500">Ví điện tử Momo</div>
                </div>
                {selectedMethod === 'momo' && (
                  <CheckCircle className="h-5 w-5 text-pink-600" />
                )}
              </button>

              {/* PayPal */}
              <button
                onClick={() => setSelectedMethod('paypal')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                  selectedMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">PayPal</div>
                  <div className="text-sm text-gray-500">Thẻ quốc tế, PayPal</div>
                </div>
                {selectedMethod === 'paypal' && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Bảo mật thanh toán</div>
                <div>Thông tin thanh toán của bạn được mã hóa và bảo vệ bởi VNPay. Chúng tôi không lưu trữ thông tin thẻ tín dụng.</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                `Thanh toán ${amount.toLocaleString('vi-VN')}đ`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 