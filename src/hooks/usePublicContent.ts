import { useState, useEffect, useCallback } from 'react';
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

  // Load initial subjects
  useEffect(() => {
    const loadInitialSubjects = async () => {
      setIsLoading(true);
      try {
        const initialSubjects = await loadPublicSubjects();
        setSubjects(initialSubjects as Subject[]);
      } catch (error) {
        console.error('Error loading initial subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialSubjects();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToPublicSubjects((updatedSubjects) => {
      console.log('Public subjects updated:', updatedSubjects);
      setSubjects(updatedSubjects as Subject[]);
    });

    return unsubscribe;
  }, []);

  const saveSubject = useCallback(async (subject: Subject): Promise<boolean> => {
    try {
      console.log('Saving public subject:', subject);
      const success = await savePublicSubject(subject);
      if (success) {
        console.log('Public subject saved successfully');
      }
      return success;
    } catch (error) {
      console.error('Error saving public subject:', error);
      return false;
    }
  }, []);

  const deleteSubject = useCallback(async (subjectId: string): Promise<boolean> => {
    try {
      console.log('Deleting public subject:', subjectId);
      const success = await deletePublicSubject(subjectId);
      if (success) {
        console.log('Public subject deleted successfully');
      }
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