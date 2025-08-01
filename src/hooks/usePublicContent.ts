import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  loadPublicMajors,
  loadSubjectsByMajor,
  loadExamsBySubject,
  subscribeToPublicMajors,
  subscribeToSubjectsByMajor,
  Major,
  Subject,
  Exam
} from '../config/firebase';

interface SubjectWithExams {
  id: string;
  majorId: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  exams: Exam[];
}

interface UsePublicContentReturn {
  majors: Major[];
  subjects: SubjectWithExams[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

export const usePublicContent = (): UsePublicContentReturn => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithExams[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  // Load initial data - chỉ load một lần
  useEffect(() => {
    // Prevent double loading in Strict Mode
    if (hasLoadedRef.current) {
      return;
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        console.log('[usePublicContent] Loading initial data...');
        
        // Load majors
        const initialMajors = await loadPublicMajors();
        console.log('[usePublicContent] Loaded majors:', initialMajors);
        setMajors(initialMajors as Major[]);
        
        // Load all subjects with their exams for all majors
        const allSubjects: SubjectWithExams[] = [];
        for (const major of initialMajors as Major[]) {
          const majorSubjects = await loadSubjectsByMajor(major.id);
          console.log(`[usePublicContent] Loaded subjects for major ${major.id}:`, majorSubjects);
          
          // Load exams for each subject
          for (const subject of majorSubjects as Subject[]) {
            const subjectExams = await loadExamsBySubject(subject.id);
            console.log(`[usePublicContent] Loaded exams for subject ${subject.id}:`, subjectExams);
            
            allSubjects.push({
              ...subject,
              exams: subjectExams as Exam[]
            });
          }
        }
        
        console.log('[usePublicContent] All subjects with exams loaded:', allSubjects);
        setSubjects(allSubjects);
        
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('[usePublicContent] Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array to run only once

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('[usePublicContent] Refreshing data...');
      
      // Load majors
      const refreshedMajors = await loadPublicMajors();
      console.log('[usePublicContent] Refreshed majors:', refreshedMajors);
      setMajors(refreshedMajors as Major[]);
      
      // Load all subjects with their exams for all majors
      const allSubjects: SubjectWithExams[] = [];
      for (const major of refreshedMajors as Major[]) {
        const majorSubjects = await loadSubjectsByMajor(major.id);
        console.log(`[usePublicContent] Refreshed subjects for major ${major.id}:`, majorSubjects);
        
        // Load exams for each subject
        for (const subject of majorSubjects as Subject[]) {
          const subjectExams = await loadExamsBySubject(subject.id);
          console.log(`[usePublicContent] Refreshed exams for subject ${subject.id}:`, subjectExams);
          
          allSubjects.push({
            ...subject,
            exams: subjectExams as Exam[]
          });
        }
      }
      
      console.log('[usePublicContent] All refreshed subjects with exams:', allSubjects);
      setSubjects(allSubjects);
    } catch (error) {
      console.error('[usePublicContent] Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    majors,
    subjects,
    isLoading,
    refreshData
  };
}; 