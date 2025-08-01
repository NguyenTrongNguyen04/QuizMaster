# Cấu hình Firebase Realtime Database cho QuizMaster

## Tổng quan
QuizMaster sử dụng Firebase Realtime Database để lưu trữ thông tin người dùng, tiến độ học tập và các dữ liệu khác. Hướng dẫn này sẽ giúp bạn thiết lập database một cách an toàn và hiệu quả.

## Bước 1: Bật Firebase Realtime Database

### 1.1. Truy cập Firebase Console
1. Đăng nhập vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Trong sidebar, click **Realtime Database**

### 1.2. Tạo Database
1. Click **Create Database**
2. Chọn **Start in test mode** (cho development)
3. Chọn location gần nhất (ví dụ: `asia-southeast1`)
4. Click **Done**

## Bước 2: Cấu hình Security Rules

### 2.1. Cập nhật Rules
Trong Firebase Console > Realtime Database > Rules, thay thế rules hiện tại bằng:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "public": {
      "majors": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
      },
      "subjects": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
      },
      "exams": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
      },
      "questions": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "admins": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "userData": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    }
  }
}
```

### 2.2. Giải thích Rules
- **users**: Chỉ user đó hoặc admin mới có thể đọc/ghi
- **subjects**: Tất cả user đã đăng nhập có thể đọc, chỉ admin mới có thể ghi
- **questions**: Tương tự subjects
- **userData**: Dữ liệu riêng tư của từng user

## Bước 3: Cấu trúc Database

### 3.1. Cấu trúc Users
```json
{
  "users": {
    "user_id_1": {
      "uid": "user_id_1",
      "email": "user1@gmail.com",
      "displayName": "Nguyễn Văn A",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T10:30:00Z",
      "profile": {
        "avatar": "https://...",
        "bio": "Học sinh lớp 12",
        "preferences": {
          "theme": "light",
          "language": "vi"
        }
      },
      "progress": {
        "totalQuestions": 150,
        "correctAnswers": 120,
        "studyTime": 3600,
        "lastStudyDate": "2024-01-15T10:30:00Z"
      }
    },
    "admin_id_1": {
      "uid": "admin_id_1",
      "email": "admin@gmail.com",
      "displayName": "Admin",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T11:00:00Z"
    }
  }
}
```

### 3.2. Cấu trúc UserData (Private Data)
```json
{
  "userData": {
    "user_id_1": {
      "flashcardProgress": [
        {
          "questionId": "question_1",
          "known": true,
          "reviewCount": 3,
          "lastReviewed": "2024-01-15T10:30:00Z",
          "bookmarked": false
        }
      ],
      "quizResults": [
        {
          "id": "result_1",
          "date": "2024-01-15T10:30:00Z",
          "subjectId": "subject_1",
          "examId": "exam_1",
          "questions": [...],
          "userAnswers": [0, 1, 2, 3],
          "score": 85,
          "totalQuestions": 20,
          "timeSpent": 1800
        }
      ]
    }
  }
}
```

## Bước 4: Kiểm tra cấu hình

### 4.1. Test Database Connection
1. Chạy ứng dụng: `npm run dev`
2. Đăng nhập với tài khoản mới
3. Kiểm tra Firebase Console > Realtime Database
4. Xác nhận user profile được tạo tự động

### 4.2. Test Security Rules
1. Đăng nhập với user thường
2. Thử truy cập dữ liệu của user khác
3. Xác nhận không thể truy cập được

## Bước 5: Production Deployment

### 5.1. Cập nhật Security Rules
Trước khi deploy production, cập nhật rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".validate": "newData.hasChildren(['uid', 'email', 'role', 'createdAt', 'lastLogin'])"
      }
    },
    "userData": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    }
  }
}
```

### 5.2. Backup và Monitoring
1. Thiết lập backup tự động
2. Monitor database usage
3. Thiết lập alerts cho quota limits

## Troubleshooting

### Lỗi thường gặp

#### 1. "Permission denied"
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra security rules
- Kiểm tra user role

#### 2. "Database not found"
- Kiểm tra Firebase config
- Kiểm tra database URL
- Kiểm tra project ID

#### 3. "Quota exceeded"
- Kiểm tra usage trong Firebase Console
- Tối ưu hóa queries
- Upgrade plan nếu cần

### Debug Commands
```javascript
// Kiểm tra database connection
import { getDatabase, ref, get } from 'firebase/database';
const db = getDatabase();
const testRef = ref(db, 'test');
get(testRef).then((snapshot) => {
  console.log('Database connected:', snapshot.exists());
});

// Kiểm tra user data
const userRef = ref(db, `users/${user.uid}`);
onValue(userRef, (snapshot) => {
  console.log('User data:', snapshot.val());
});
```

## Tính năng Database trong QuizMaster

### User Management
- Tự động tạo profile khi đăng ký
- Cập nhật thông tin user realtime
- Role-based access control

### Progress Tracking
- Lưu tiến độ học tập
- Thống kê performance
- Báo cáo chi tiết

### Data Synchronization
- Realtime sync across devices
- Offline support
- Conflict resolution

### Security
- User-specific data isolation
- Admin access control
- Data validation

## Best Practices

### 1. Data Structure
- Sử dụng nested objects hợp lý
- Tránh deep nesting (>3 levels)
- Sử dụng arrays cho ordered data

### 2. Performance
- Index frequently queried fields
- Limit query results
- Use pagination cho large datasets

### 3. Security
- Validate data trước khi write
- Implement proper access control
- Monitor suspicious activities

### 4. Backup
- Regular automated backups
- Test restore procedures
- Document backup strategy 