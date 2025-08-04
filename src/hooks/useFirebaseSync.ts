import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  getCurrentUser, 
  saveUserData, 
  loadUserData, 
  subscribeToUserData 
} from '../config/firebase';
import { Subject, FlashcardProgress, QuizResult } from '../types';

interface SyncData {
  // subjects: Subject[]; // XÓA dòng này
  flashcardProgress: FlashcardProgress[];
  quizResults: QuizResult[];
}

interface UseFirebaseSyncReturn {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncToCloud: (data: SyncData) => Promise<boolean>;
  syncFromCloud: () => Promise<boolean>;
}

export const useFirebaseSync = (
  // localSubjects: Subject[], // XÓA tham số này
  localProgress: FlashcardProgress[],
  localResults: QuizResult[],
  onDataUpdate: (data: SyncData) => void
): UseFirebaseSyncReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const subscriptionRef = useRef<(() => void) | null>(null);
  const isSubscribedRef = useRef(false);

  // Subscribe to real-time updates when user is authenticated
  useEffect(() => {
    const user = getCurrentUser();
    
    if (!user) {
      setIsConnected(false);
      return;
    }

    // Prevent double subscription in Strict Mode
    if (isSubscribedRef.current) {
      return;
    }

    setIsConnected(true);
    isSubscribedRef.current = true;

    const unsubscribe = subscribeToUserData(user.uid, (cloudData) => {
      if (cloudData && cloudData.lastUpdated) {
        const cloudLastUpdate = new Date(cloudData.lastUpdated);
        const localLastUpdate = lastSyncTime;

        // Only update if cloud data is newer
        if (!localLastUpdate || cloudLastUpdate > localLastUpdate) {
          onDataUpdate({
            flashcardProgress: cloudData.flashcardProgress || [],
            quizResults: cloudData.quizResults || []
          });
          setLastSyncTime(cloudLastUpdate);
        }
      }
    });

    subscriptionRef.current = unsubscribe;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
      isSubscribedRef.current = false;
    };
  }, [onDataUpdate]); // Removed lastSyncTime from dependency

  const syncToCloud = useCallback(async (data: SyncData): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) {
      return false;
    }

    setIsSyncing(true);
    try {
      const success = await saveUserData(user.uid, data);
      if (success) {
        setLastSyncTime(new Date());
      }
      return success;
    } catch (error) {
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []); // Removed getCurrentUserData dependency

  const syncFromCloud = useCallback(async (): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) {
      return false;
    }

    setIsSyncing(true);
    try {
      const cloudData = await loadUserData(user.uid);
      if (cloudData) {
        onDataUpdate({
          flashcardProgress: cloudData.flashcardProgress || [],
          quizResults: cloudData.quizResults || []
        });
        setLastSyncTime(new Date(cloudData.lastUpdated));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [onDataUpdate]); // Removed getCurrentUserData dependency

  return {
    isConnected,
    isSyncing,
    lastSyncTime,
    syncToCloud,
    syncFromCloud
  };
}; 