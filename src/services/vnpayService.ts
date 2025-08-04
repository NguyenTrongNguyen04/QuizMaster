import axios from 'axios';
import CryptoJS from 'crypto-js';

export interface VNPayConfig {
  vnp_TmnCode: string; // Merchant code
  vnp_HashSecret: string; // Secret key
  vnp_Url: string; // Payment URL
  vnp_ReturnUrl: string; // Return URL after payment
}

export interface VNPayPaymentRequest {
  amount: number; // Amount in VND
  orderId: string; // Unique order ID
  orderInfo: string; // Order description
  locale?: string; // Language (vn/en)
  currency?: string; // Currency code
  ipAddr?: string; // Customer IP address
}

export interface VNPayPaymentResponse {
  vnp_ResponseCode: string;
  vnp_OrderInfo: string;
  vnp_OrderId: string;
  vnp_Amount: string;
  vnp_TransactionNo: string;
  vnp_TransactionDate: string;
  vnp_SecureHash: string;
}

class VNPayService {
  private config: VNPayConfig;

  constructor(config: VNPayConfig) {
    this.config = config;
  }

  // Create payment URL
  createPaymentUrl(request: VNPayPaymentRequest): string {
    const date = new Date();
    const createDate = date.toISOString().split('T')[0].split('-').join('');

    const orderType = 'billpayment';
    const locale = request.locale || 'vn';
    const currency = request.currency || 'VND';
    const ipAddr = request.ipAddr || '127.0.0.1';

    const txnRef = request.orderId;
    const amount = request.amount.toString();

    const vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.vnp_TmnCode,
      vnp_Amount: amount,
      vnp_CurrCode: currency,
      vnp_BankCode: '',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: request.orderInfo,
      vnp_OrderType: orderType,
      vnp_Locale: locale,
      vnp_ReturnUrl: this.config.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sort parameters alphabetically
    const sortedParams = this.sortObject(vnpParams);
    
    // Create query string
    const queryString = this.createQueryString(sortedParams);
    
    // Create secure hash
    const secureHash = this.createSecureHash(queryString);
    
    // Add secure hash to query string
    const finalQueryString = queryString + '&vnp_SecureHash=' + secureHash;
    
    return this.config.vnp_Url + '?' + finalQueryString;
  }

  // Verify payment response
  verifyPaymentResponse(response: VNPayPaymentResponse): boolean {
    const vnpParams: any = { ...response };
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // Sort parameters alphabetically
    const sortedParams = this.sortObject(vnpParams);
    
    // Create query string
    const queryString = this.createQueryString(sortedParams);
    
    // Create secure hash
    const secureHash = this.createSecureHash(queryString);
    
    // Compare with received secure hash
    return secureHash === response.vnp_SecureHash;
  }

  // Check if payment is successful
  isPaymentSuccessful(response: VNPayPaymentResponse): boolean {
    return response.vnp_ResponseCode === '00';
  }

  // Get payment status message
  getPaymentStatusMessage(responseCode: string): string {
    const statusMessages: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Giao dịch bị nghi ngờ',
      '09': 'Giao dịch không thành công',
      '10': 'Giao dịch không thành công',
      '11': 'Giao dịch không thành công',
      '12': 'Giao dịch không thành công',
      '13': 'Giao dịch không thành công',
      '24': 'Giao dịch không thành công',
      '51': 'Giao dịch không thành công',
      '65': 'Giao dịch không thành công',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công',
      '99': 'Các lỗi khác',
    };

    return statusMessages[responseCode] || 'Giao dịch không thành công';
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = obj[str[key]];
    }
    return sorted;
  }

  private createQueryString(params: any): string {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    return queryString;
  }

  private createSecureHash(queryString: string): string {
    const hashData = queryString;
    const secretKey = this.config.vnp_HashSecret;
    const hmac = CryptoJS.HmacSHA512(hashData, secretKey);
    return hmac.toString(CryptoJS.enc.Hex);
  }
}

// Default VNPay configuration (for development)
// TODO: Replace with your actual VNPay merchant credentials after registration
const defaultConfig: VNPayConfig = {
  vnp_TmnCode: 'DEMOVNPAY', // Replace with your merchant code from VNPay email
  vnp_HashSecret: 'DEMOSECRET', // Replace with your secret key from VNPay email
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // Sandbox URL
  vnp_ReturnUrl: 'http://localhost:5173/payment/callback', // Your return URL
};

// Production config example (uncomment when ready for production):
// const productionConfig: VNPayConfig = {
//   vnp_TmnCode: 'YOUR_MERCHANT_CODE', // From VNPay email
//   vnp_HashSecret: 'YOUR_SECRET_KEY', // From VNPay email  
//   vnp_Url: 'https://pay.vnpay.vn/vpcpay.html', // Production URL
//   vnp_ReturnUrl: 'https://yourdomain.com/payment/callback', // Your production domain
// };

export const vnpayService = new VNPayService(defaultConfig);

export default VNPayService; 