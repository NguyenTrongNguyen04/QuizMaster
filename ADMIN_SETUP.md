# Admin Setup Guide

## Method 1: Using Cloud Functions (Recommended)

### Prerequisites
- Firebase project must be on **Blaze plan** (pay-as-you-go)
- Upgrade at: https://console.firebase.google.com/project/quizmaster-fptu/usage/details

### Setup Steps
1. **Deploy Cloud Functions**
   ```bash
   firebase deploy --only functions
   ```

2. **Create Admin User**
   - Go to Firebase Console > Authentication > Users
   - Click "Add user"
   - Email: `admin@company.com`
   - Password: `admin123456`

3. **Set Admin Role**
   - Use the `setAdminRole` function with the user's UID

## Method 2: Manual Setup (Free - No Cloud Functions)

### Step 1: Create Admin User
1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Email: `admin@company.com`
4. Password: `admin123456`

### Step 2: Set Custom Claims Manually
1. Go to Firebase Console > Authentication > Users
2. Find your admin user
3. Click the three dots (...) > "Custom claims"
4. Add:
   ```json
   {
     "role": "admin"
   }
   ```

### Step 3: Update Security Rules
```json
{
  "rules": {
    "public": {
      ".read": true,
      ".write": "auth != null && auth.token.role === 'admin'",
      "subjects": {
        ".read": true,
        ".write": "auth != null && auth.token.role === 'admin'"
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Step 4: Test Admin Login
1. Go to your app
2. Click "Đăng nhập Admin"
3. Use email: `admin@company.com`, password: `admin123456`
4. Verify admin privileges

## Method 3: Simple Role-Based Access (No Custom Claims)

### Alternative Approach
If you don't want to use Custom Claims, you can:

1. **Store admin emails in Firebase**
   ```json
   {
     "admins": {
       "admin@company.com": true,
       "another@company.com": true
     }
   }
   ```

2. **Check admin status in app**
   ```typescript
   const isAdmin = adminEmails.includes(user.email);
   ```

3. **Update security rules**
   ```json
   {
     "rules": {
       "public": {
         ".read": true,
         ".write": "auth != null && root.child('admins').child(auth.token.email).exists()"
       }
     }
   }
   ```

## Testing Admin Access

### Test Cases
1. **Anonymous user**: Can only view content
2. **Regular user**: Can only view content  
3. **Admin user**: Can view and manage content

### Expected Behavior
- **Anonymous/Regular**: No "Quản lý" tab
- **Admin**: "Quản lý" tab visible, can add/edit/delete content

## Troubleshooting

### Common Issues
1. **"auth/invalid-api-key"**: Check environment variables
2. **"permission-denied"**: Check security rules
3. **Custom claims not working**: Wait 5-10 minutes for propagation

### Debug Steps
1. Check Firebase Console > Authentication > Users
2. Verify custom claims are set
3. Check browser console for errors
4. Test with different user types 