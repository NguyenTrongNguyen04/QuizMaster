import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  signInUser, 
  getCurrentUser, 
  onAuthChange, 
  saveUserData, 
  loadUserData, 
  subscribeToUserData 
} from '../config/firebase';
import { Subject, FlashcardProgress, QuizResult } from '../types';

interface SyncData {
  subjects: Subject[];
  flashcardProgress: FlashcardProgress[];
  quizResults: QuizResult[];
}

interface UseFirebaseSyncReturn {
  user: User | null;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncToCloud: (data: SyncData) => Promise<boolean>;
  syncFromCloud: () => Promise<boolean>;
  signIn: () => Promise<void>;
  signOut: () => void;
}

export const useFirebaseSync = (
  localSubjects: Subject[],
  localProgress: FlashcardProgress[],
  localResults: QuizResult[],
  onDataUpdate: (data: SyncData) => void
): UseFirebaseSyncReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check authentication state on mount
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      setIsConnected(!!user);
      
      // If user is authenticated, load initial data
      if (user && !hasInitialized) {
        setHasInitialized(true);
        loadUserData(user.uid).then((cloudData) => {
          if (cloudData && cloudData.subjects) {
            console.log('Loading initial data from cloud:', cloudData);
            onDataUpdate({
              subjects: cloudData.subjects || [],
              flashcardProgress: cloudData.flashcardProgress || [],
              quizResults: cloudData.quizResults || []
            });
            setLastSyncTime(new Date(cloudData.lastUpdated));
          }
        });
      }
    });

    return unsubscribe;
  }, [hasInitialized, onDataUpdate]);

  // Subscribe to real-time updates when user is authenticated
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time listener for user:', user.uid);
    const unsubscribe = subscribeToUserData(user.uid, (cloudData) => {
      console.log('Real-time update received:', cloudData);
      if (cloudData && cloudData.lastUpdated) {
        const cloudLastUpdate = new Date(cloudData.lastUpdated);
        const localLastUpdate = lastSyncTime;

        // Only update if cloud data is newer or if we don't have local data
        if (!localLastUpdate || cloudLastUpdate > localLastUpdate) {
          console.log('Updating local data from cloud');
          onDataUpdate({
            subjects: cloudData.subjects || [],
            flashcardProgress: cloudData.flashcardProgress || [],
            quizResults: cloudData.quizResults || []
          });
          setLastSyncTime(cloudLastUpdate);
        }
      }
    });

    return unsubscribe;
  }, [user, lastSyncTime, onDataUpdate]);

  const signIn = useCallback(async () => {
    setIsSyncing(true);
    try {
      console.log('Attempting to sign in...');
      const user = await signInUser();
      if (user) {
        console.log('Sign in successful:', user.uid);
        setUser(user);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const signOut = useCallback(() => {
    console.log('Signing out...');
    setUser(null);
    setIsConnected(false);
    setLastSyncTime(null);
    setHasInitialized(false);
  }, []);

  const syncToCloud = useCallback(async (data: SyncData): Promise<boolean> => {
    if (!user) {
      console.log('No user, cannot sync to cloud');
      return false;
    }

    setIsSyncing(true);
    try {
      console.log('Syncing to cloud for user:', user.uid);
      const success = await saveUserData(user.uid, data);
      if (success) {
        setLastSyncTime(new Date());
        console.log('Sync to cloud successful');
      }
      return success;
    } catch (error) {
      console.error('Sync to cloud failed:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const syncFromCloud = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.log('No user, cannot sync from cloud');
      return false;
    }

    setIsSyncing(true);
    try {
      console.log('Syncing from cloud for user:', user.uid);
      const cloudData = await loadUserData(user.uid);
      if (cloudData) {
        console.log('Cloud data loaded:', cloudData);
        onDataUpdate({
          subjects: cloudData.subjects || [],
          flashcardProgress: cloudData.flashcardProgress || [],
          quizResults: cloudData.quizResults || []
        });
        setLastSyncTime(new Date(cloudData.lastUpdated));
        return true;
      }
      console.log('No cloud data found');
      return false;
    } catch (error) {
      console.error('Sync from cloud failed:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, onDataUpdate]);

  return {
    user,
    isConnected,
    isSyncing,
    lastSyncTime,
    syncToCloud,
    syncFromCloud,
    signIn,
    signOut
  };
}; 