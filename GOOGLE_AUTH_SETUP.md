# Cấu hình Google Authentication cho QuizMaster

## Tổng quan
QuizMaster hỗ trợ đăng nhập bằng Google thông qua Firebase Authentication. Hướng dẫn này sẽ giúp bạn cấu hình Google Authentication cho dự án.

## Bước 1: Cấu hình Firebase Console

### 1.1. Truy cập Firebase Console
1. Đăng nhập vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn

### 1.2. Bật Google Authentication
1. Trong sidebar, chọn **Authentication**
2. Chọn tab **Sign-in method**
3. Tìm **Google** trong danh sách providers
4. Click vào **Google** để cấu hình
5. Bật **Enable** switch
6. Nhập **Project support email** (email của bạn)
7. Click **Save**

### 1.3. Cấu hình OAuth consent screen (nếu cần)
1. Trong Google Cloud Console, chọn project của bạn
2. Điều hướng đến **APIs & Services** > **OAuth consent screen**
3. Cấu hình thông tin cần thiết:
   - App name: "QuizMaster"
   - User support email
   - Developer contact information
4. Thêm scopes cần thiết:
   - `email`
   - `profile`
   - `openid`

## Bước 2: Cấu hình Authorized Domains

### 2.1. Thêm domain vào Firebase
1. Trong Firebase Console > Authentication > Settings
2. Scroll xuống phần **Authorized domains**
3. Thêm các domain của bạn:
   - `localhost` (cho development)
   - Domain production của bạn (ví dụ: `quizmaster.com`)

### 2.2. Cấu hình cho Development
- Đảm bảo `localhost` đã được thêm vào authorized domains
- Port mặc định `5173` sẽ được tự động hỗ trợ

## Bước 3: Kiểm tra cấu hình

### 3.1. Test Google Authentication
1. Chạy ứng dụng: `npm run dev`
2. Điều hướng đến `/auth`
3. Click button "Tiếp tục với Google"
4. Kiểm tra xem popup có mở và đăng nhập thành công không

### 3.2. Debug nếu có lỗi
- Kiểm tra Console trong Developer Tools
- Đảm bảo Firebase config đúng
- Kiểm tra authorized domains

## Bước 4: Production Deployment

### 4.1. Cấu hình Production Domain
1. Thêm domain production vào Firebase authorized domains
2. Cập nhật environment variables cho production
3. Test authentication trên production

### 4.2. Security Considerations
- Đảm bảo HTTPS được bật trên production
- Kiểm tra CSP (Content Security Policy) nếu có
- Monitor authentication logs trong Firebase Console

## Troubleshooting

### Lỗi thường gặp

#### 1. "popup_closed_by_user"
- User đóng popup trước khi hoàn thành
- Giải pháp: Thông báo user không đóng popup

#### 2. "auth/unauthorized-domain"
- Domain không được authorize
- Giải pháp: Thêm domain vào Firebase Console

#### 3. "auth/network-request-failed"
- Lỗi network
- Giải pháp: Kiểm tra kết nối internet

### Debug Commands
```javascript
// Kiểm tra Firebase config
console.log('Firebase config:', firebaseConfig);

// Kiểm tra auth state
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user);
});

// Test Google sign in
const provider = new GoogleAuthProvider();
signInWithPopup(auth, provider)
  .then((result) => {
    console.log('Google sign in success:', result.user);
  })
  .catch((error) => {
    console.error('Google sign in error:', error);
  });
```

## Tính năng Google Authentication trong QuizMaster

### UI/UX
- Button Google với logo chính thức
- Loading state khi đang xử lý
- Error handling và thông báo lỗi
- Responsive design

### Security
- Firebase handles OAuth flow
- Secure token management
- Automatic session management
- CSRF protection

### User Experience
- One-click sign in
- Automatic account creation
- Seamless integration với existing auth flow
- Consistent với design system

## Code Implementation

### AuthPage Component
```typescript
const handleGoogleSignIn = async () => {
  setGoogleLoading(true);
  setError('');

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log('[AuthPage] Google sign in successful:', result.user.email);
    navigate('/');
  } catch (error: any) {
    console.error('[AuthPage] Google sign in error:', error);
    setError('Đăng nhập bằng Google thất bại');
  } finally {
    setGoogleLoading(false);
  }
};
```

### Firebase Configuration
```typescript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Provider setup
const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');
```

## Best Practices

### 1. Error Handling
- Catch và handle tất cả authentication errors
- Hiển thị user-friendly error messages
- Log errors cho debugging

### 2. Loading States
- Hiển thị loading indicator khi đang xử lý
- Disable buttons khi đang loading
- Prevent multiple simultaneous requests

### 3. User Experience
- Clear call-to-action buttons
- Consistent styling với design system
- Responsive design cho mobile

### 4. Security
- Validate user permissions sau khi login
- Handle session expiration
- Secure token storage 