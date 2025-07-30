import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  subscribeToPublicSubjects, 
  savePublicSubject, 
  deletePublicSubject,
  loadPublicSubjects 
} from '../config/firebase';
import { Subject } from '../types';

interface UsePublicContentReturn {
  subjects: Subject[];
  isLoading: boolean;
  saveSubject: (subject: Subject) => Promise<boolean>;
  deleteSubject: (subjectId: string) => Promise<boolean>;
  refreshSubjects: () => Promise<void>;
}

export const usePublicContent = (): UsePublicContentReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  // Load initial subjects - chỉ load một lần
  useEffect(() => {
    // Prevent double loading in Strict Mode
    if (hasLoadedRef.current) {
      return;
    }

    const loadInitialSubjects = async () => {
      setIsLoading(true);
      try {
        const initialSubjects = await loadPublicSubjects();
        setSubjects(initialSubjects as Subject[]);
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading initial subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialSubjects();
  }, []); // Empty dependency array to run only once

  const saveSubject = useCallback(async (subject: Subject): Promise<boolean> => {
    try {
      const success = await savePublicSubject(subject);
      return success;
    } catch (error) {
      console.error('Error saving public subject:', error);
      return false;
    }
  }, []);

  const deleteSubject = useCallback(async (subjectId: string): Promise<boolean> => {
    try {
      const success = await deletePublicSubject(subjectId);
      return success;
    } catch (error) {
      console.error('Error deleting public subject:', error);
      return false;
    }
  }, []);

  const refreshSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const refreshedSubjects = await loadPublicSubjects();
      setSubjects(refreshedSubjects as Subject[]);
    } catch (error) {
      console.error('Error refreshing subjects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    subjects,
    isLoading,
    saveSubject,
    deleteSubject,
    refreshSubjects
  };
}; 