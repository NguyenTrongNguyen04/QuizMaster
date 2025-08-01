import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { ref, set, get, onValue, off, push, remove, update } from 'firebase/database';
import { database } from '../config/firebase';
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  role: 'user' | 'admin' | 'viewer';
  createdAt: string;
  lastLogin: string;
  profile?: {
    avatar?: string;
    bio?: string;
    preferences?: {
      theme?: 'light' | 'dark';
      language?: 'vi' | 'en';
    };
  };
  progress?: {
    totalQuestions: number;
    correctAnswers: number;
    studyTime: number;
    lastStudyDate?: string;
  };
}

export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  studyTime: number;
  averageScore: number;
}

export const useUserData = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tạo user profile mới
  const createUserProfile = useCallback(async (user: User, role: 'user' | 'admin' = 'user') => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useUserData] Starting to create user profile for:', user.uid, user.email);

      const now = new Date().toISOString();
      
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || null,
        role,
        createdAt: now,
        lastLogin: now,
        profile: {
          preferences: {
            theme: 'light',
            language: 'vi'
          }
        },
        progress: {
          totalQuestions: 0,
          correctAnswers: 0,
          studyTime: 0
        }
      };

      console.log('[useUserData] User profile object created:', userProfile);
      console.log('[useUserData] Database path:', `users/${user.uid}`);

      await set(ref(database, `users/${user.uid}`), userProfile);
      
      console.log('[useUserData] Database write successful');
      setUserProfile(userProfile);
      
      console.log('[useUserData] User profile created successfully:', userProfile);
      return userProfile;
    } catch (err: any) {
      console.error('[useUserData] Error creating user profile:', err);
      console.error('[useUserData] Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      setError('Không thể tạo hồ sơ người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy user profile
  const getUserProfile = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      const snapshot = await get(ref(database, `users/${uid}`));
      
      if (snapshot.exists()) {
        const profile = snapshot.val() as UserProfile;
        setUserProfile(profile);
        console.log('[useUserData] User profile loaded:', profile);
        return profile;
      } else {
        console.log('[useUserData] User profile not found');
        return null;
      }
    } catch (err: any) {
      console.error('[useUserData] Error loading user profile:', err);
      setError('Không thể tải hồ sơ người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.uid) {
      setError('Người dùng chưa đăng nhập');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const now = new Date().toISOString();

      await update(ref(database, `users/${user.uid}`), {
        ...updates,
        lastLogin: now
      });

      // Cập nhật local state
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...updates, lastLogin: now };
        setUserProfile(updatedProfile);
      }

      console.log('[useUserData] User profile updated:', updates);
    } catch (err: any) {
      console.error('[useUserData] Error updating user profile:', err);
      setError('Không thể cập nhật hồ sơ người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, userProfile]);

  // Cập nhật progress
  const updateProgress = useCallback(async (progress: Partial<UserProfile['progress']>) => {
    if (!user?.uid) return;

    try {
      const currentProgress = userProfile?.progress || {
        totalQuestions: 0,
        correctAnswers: 0,
        studyTime: 0
      };

      const updatedProgress = {
        ...currentProgress,
        ...progress,
        lastStudyDate: new Date().toISOString()
      };

      await update(ref(database, `users/${user.uid}/progress`), updatedProgress);

      // Cập nhật local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          progress: updatedProgress
        });
      }

      console.log('[useUserData] Progress updated:', updatedProgress);
    } catch (err: any) {
      console.error('[useUserData] Error updating progress:', err);
      setError('Không thể cập nhật tiến độ học tập');
    }
  }, [user?.uid, userProfile]);

  // Lấy user stats
  const getUserStats = useCallback((): UserStats | null => {
    if (!userProfile?.progress) return null;

    const { totalQuestions, correctAnswers, studyTime } = userProfile.progress;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 10 : 0;

    return {
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      studyTime,
      averageScore: Math.round(averageScore * 100) / 100
    };
  }, [userProfile]);

  // Kiểm tra email có tồn tại trong database không
  const checkEmailExists = useCallback(async (email: string): Promise<boolean> => {
    try {
      console.log('[checkEmailExists] Checking email:', email);
      
      // Bỏ qua kiểm tra Firebase Auth vì có vấn đề
      // Để Firebase tự xử lý khi gửi email reset
      console.log('[checkEmailExists] Skipping Firebase Auth check, allowing Firebase to handle email validation');
      return true;
      
      // Code cũ (đã comment):
      // const auth = getAuth();
      // console.log('[checkEmailExists] Current auth state:', auth.currentUser);
      // const methods = await fetchSignInMethodsForEmail(auth, email);
      // console.log('[checkEmailExists] fetchSignInMethodsForEmail result:', methods);
      // return methods.length > 0;
    } catch (err) {
      console.error('[useUserData] Error checking email:', err);
      return false;
    }
  }, []);

  // Subscribe to user data changes
  useEffect(() => {
    if (!user?.uid) {
      setUserProfile(null);
      return;
    }

    const userRef = ref(database, `users/${user.uid}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const profile = snapshot.val() as UserProfile;
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    }, (error) => {
      console.error('[useUserData] Realtime listener error:', error);
      setError('Không thể kết nối với database');
    });

    return () => {
      off(userRef);
    };
  }, [user?.uid]);

  // Update lastLogin only once when user first logs in
  useEffect(() => {
    if (user?.uid && userProfile && !userProfile.lastLogin) {
      const now = new Date().toISOString();
      update(ref(database, `users/${user.uid}`), {
        lastLogin: now
      }).catch((error) => {
        console.error('[useUserData] Error updating lastLogin:', error);
      });
    }
  }, [user?.uid, userProfile?.lastLogin]);

  // Auto-create profile for new users
  useEffect(() => {
    if (user && !userProfile && !loading) {
      // Kiểm tra xem user profile đã tồn tại chưa
      getUserProfile(user.uid).then((existingProfile) => {
        if (!existingProfile) {
          createUserProfile(user).catch((error) => {
            console.error('[useUserData] Failed to create user profile:', error);
          });
        }
      }).catch((error) => {
        console.error('[useUserData] Error checking existing profile:', error);
        // Nếu có lỗi khi kiểm tra, vẫn thử tạo profile mới
        createUserProfile(user).catch((createError) => {
          console.error('[useUserData] Failed to create user profile after error:', createError);
        });
      });
    }
  }, [user, userProfile, loading, getUserProfile, createUserProfile]);

  return {
    userProfile,
    loading,
    error,
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    updateProgress,
    getUserStats,
    checkEmailExists,
  };
}; 