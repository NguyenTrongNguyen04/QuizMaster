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

  // Check authentication state on mount
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setIsConnected(!!user);
    });

    return unsubscribe;
  }, []);

  // Subscribe to real-time updates when user is authenticated
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserData(user.uid, (cloudData) => {
      if (cloudData && cloudData.lastUpdated) {
        const cloudLastUpdate = new Date(cloudData.lastUpdated);
        const localLastUpdate = lastSyncTime;

        // Only update if cloud data is newer
        if (!localLastUpdate || cloudLastUpdate > localLastUpdate) {
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
      const user = await signInUser();
      if (user) {
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
    setUser(null);
    setIsConnected(false);
    setLastSyncTime(null);
  }, []);

  const syncToCloud = useCallback(async (data: SyncData): Promise<boolean> => {
    if (!user) return false;

    setIsSyncing(true);
    try {
      const success = await saveUserData(user.uid, data);
      if (success) {
        setLastSyncTime(new Date());
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
    if (!user) return false;

    setIsSyncing(true);
    try {
      const cloudData = await loadUserData(user.uid);
      if (cloudData) {
        onDataUpdate({
          subjects: cloudData.subjects || [],
          flashcardProgress: cloudData.flashcardProgress || [],
          quizResults: cloudData.quizResults || []
        });
        setLastSyncTime(new Date(cloudData.lastUpdated));
        return true;
      }
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