import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import { auth, checkAdminStatus } from '../config/firebase';

export type UserRole = 'admin' | 'viewer' | null;

interface AuthState {
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
  canWrite: boolean;
  canRead: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<User>;
  signInAnonymously: () => Promise<User>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    userRole: null,
    isLoading: true,
    canWrite: false,
    canRead: false,
    error: null,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authListenerRef = useRef<(() => void) | null>(null);
  const lastCheckedEmail = useRef<string>('');
  const isCheckingAdmin = useRef<boolean>(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      if (!user) {
        const newState = {
          user: null,
          userRole: null,
          isLoading: false,
          canWrite: false,
          canRead: true,
          error: null,
        };
        setState(newState);
        lastCheckedEmail.current = '';
        return;
      }

      // Set loading state
      const loadingState = {
        user,
        userRole: null,
        isLoading: true,
        canWrite: false,
        canRead: true,
        error: null,
      };
      setState(loadingState);

      try {
        // Check if user is anonymous
        if (user.isAnonymous) {
          const anonymousState = {
            user,
            userRole: 'viewer' as UserRole,
            isLoading: false,
            canWrite: false,
            canRead: true,
            error: null,
          };
          setState(anonymousState);
          lastCheckedEmail.current = '';
          return;
        }

        // Check if we already checked this email recently
        const userEmail = user.email || '';
        if (lastCheckedEmail.current === userEmail && !isCheckingAdmin.current) {
          return;
        }

        // Prevent multiple simultaneous admin checks
        if (isCheckingAdmin.current) {
          return;
        }

        isCheckingAdmin.current = true;
        lastCheckedEmail.current = userEmail;
        
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error('Admin check timeout'));
          }, 3000); // Reduced timeout
        });

        const adminCheckPromise = checkAdminStatus(userEmail);
        const isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]);
        const role: UserRole = isAdmin ? 'admin' : 'viewer';

        const finalState = {
          user,
          userRole: role,
          isLoading: false,
          canWrite: role === 'admin',
          canRead: true,
          error: null,
        };
        setState(finalState);
      } catch (error) {
        const errorState = {
          user,
          userRole: 'viewer' as UserRole,
          isLoading: false,
          canWrite: false,
          canRead: true,
          error: 'Failed to check admin status',
        };
        setState(errorState);
      } finally {
        isCheckingAdmin.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    });

    authListenerRef.current = unsubscribe;

    // Fallback timer - only if still loading after 3 seconds
    const fallbackTimer = setTimeout(() => {
      setState(prev => {
        if (prev.isLoading) {
          return {
            ...prev,
            isLoading: false,
            userRole: 'viewer' as UserRole,
            canWrite: false,
            canRead: true,
          };
        }
        return prev;
      });
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearTimeout(fallbackTimer);
      if (authListenerRef.current) {
        authListenerRef.current();
      }
    };
  }, []); // Empty dependency array - only run once

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return userCredential.user;
    } catch (error: any) {
      const errorMessage = error.code === 'auth/user-not-found' ? 'Tài khoản không tồn tại' :
                          error.code === 'auth/wrong-password' ? 'Mật khẩu không đúng' :
                          error.code === 'auth/invalid-email' ? 'Email không hợp lệ' :
                          'Đăng nhập thất bại';
      
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Sign in anonymously function
  const signInAnonymously = useCallback(async (): Promise<User> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userCredential = await firebaseSignInAnonymously(auth);
      
      return userCredential.user;
    } catch (error: any) {
      const errorMessage = 'Đăng nhập ẩn danh thất bại';
      
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  }, []);

  // Refresh auth function
  const refreshAuth = useCallback(async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Re-trigger auth state change
    }
  }, []);

  // Memoized return value
  const authValue = useMemo(() => ({
    ...state,
    signIn,
    signInAnonymously,
    signOut,
    refreshAuth,
  }), [state, signIn, signInAnonymously, signOut, refreshAuth]);

  return authValue;
}; 