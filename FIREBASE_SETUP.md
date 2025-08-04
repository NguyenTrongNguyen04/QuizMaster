# 🔥 Hướng dẫn cấu hình Firebase cho Quizlet

## 📋 Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" hoặc "Add project"
3. Đặt tên project: `quizlet-app` (hoặc tên bạn muốn)
4. Chọn "Enable Google Analytics" (tùy chọn)
5. Click "Create project"

## 📋 Bước 2: Thiết lập Authentication

1. Trong Firebase Console, chọn "Authentication" từ menu bên trái
2. Click tab "Sign-in method"
3. Enable "Anonymous" authentication:
   - Click vào "Anonymous"
   - Toggle "Enable"
   - Click "Save"

## 📋 Bước 3: Thiết lập Realtime Database

1. Trong Firebase Console, chọn "Realtime Database" từ menu bên trái
2. Click "Create database"
3. Chọn "Start in test mode" (cho development)
4. Chọn location gần nhất (ví dụ: `asia-southeast1`)
5. Click "Done"

## 📋 Bước 4: Cấu hình Security Rules

1. Trong Realtime Database, click tab "Rules"
2. Thay thế rules mặc định bằng:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

3. Click "Publish"

## 📋 Bước 5: Lấy Firebase Config

1. Trong Firebase Console, click vào icon ⚙️ (Settings) > "Project settings"
2. Scroll xuống phần "Your apps"
3. Click icon web (</>) để thêm web app
4. Đặt tên app: `Quizlet Web App`
5. Click "Register app"
6. Copy config object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 📋 Bước 6: Cập nhật Config trong Code

1. Mở file `src/config/firebase.ts`
2. Thay thế `firebaseConfig` object bằng config bạn vừa copy
3. Lưu file

## 📋 Bước 7: Test ứng dụng

1. Chạy ứng dụng: `npm run dev`
2. Vào tab "Đồng bộ"
3. Click "Đăng nhập để đồng bộ"
4. Kiểm tra xem có kết nối thành công không

## 🔧 Troubleshooting

### Lỗi "Permission denied"
- Kiểm tra Security Rules đã đúng chưa
- Đảm bảo user đã đăng nhập

### Lỗi "Database not found"
- Kiểm tra `databaseURL` trong config
- Đảm bảo đã tạo Realtime Database

### Lỗi "Authentication failed"
- Kiểm tra Anonymous auth đã enable chưa
- Kiểm tra `apiKey` và `authDomain` đúng chưa

## 📱 Tính năng đồng bộ

### ✅ Đã implement:
- **Anonymous Authentication**: Đăng nhập ẩn danh
- **Real-time Sync**: Đồng bộ tự động khi có thay đổi
- **Manual Sync**: Nút đồng bộ thủ công
- **Offline Support**: Hoạt động offline với localStorage
- **Conflict Resolution**: Chỉ cập nhật khi dữ liệu cloud mới hơn

### 🔄 Cách hoạt động:
1. **Lần đầu**: User đăng nhập → Tạo anonymous account
2. **Auto sync**: Mỗi khi data thay đổi → Upload lên cloud sau 1s
3. **Real-time**: Khi có thay đổi từ thiết bị khác → Tự động cập nhật
4. **Manual**: User có thể force sync thủ công

## 🚀 Deploy lên Vercel

1. Push code lên GitHub
2. Connect với Vercel
3. Deploy tự động
4. Firebase sẽ hoạt động trên production

## 📊 Monitoring

- **Firebase Console** → Realtime Database → Xem data real-time
- **Firebase Console** → Authentication → Xem users
- **Browser DevTools** → Console → Xem logs

## 🔒 Security

- Mỗi user chỉ thấy data của mình
- Anonymous auth không cần email/password
- Data được mã hóa trong transit
- Rules bảo vệ data access

---

**Lưu ý**: Đảm bảo không commit Firebase config keys lên GitHub public repo. Trong production, nên sử dụng environment variables. 