import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  majorCodeToIdMap: { [code: string]: string };
}

export const usePublicContent = (): UsePublicContentReturn => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithExams[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const lastRefreshRef = useRef<number>(0);

  // Create mapping from major code to major ID
  const majorCodeToIdMap = useMemo(() => {
    const map: { [code: string]: string } = {};
    majors.forEach(major => {
      map[major.code] = major.id;
    });
    console.log('[usePublicContent] Major code to ID map:', map);
    return map;
  }, [majors]);

  // Load data function
  const loadData = useCallback(async (isInitialLoad = false) => {
    // Prevent double loading in Strict Mode for initial load only
    if (isInitialLoad && hasLoadedRef.current) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('[usePublicContent] Loading data...', { isInitialLoad });
      
      // Load majors
      const loadedMajors = await loadPublicMajors();
      console.log('[usePublicContent] Loaded majors:', loadedMajors);
      setMajors(loadedMajors as Major[]);
      
      // Load all subjects with their exams for all majors
      const allSubjects: SubjectWithExams[] = [];
      for (const major of loadedMajors as Major[]) {
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
      
      if (isInitialLoad) {
        hasLoadedRef.current = true;
      }
      lastRefreshRef.current = Date.now();
    } catch (error) {
      console.error('[usePublicContent] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-refresh data every 30 seconds to catch new changes
  // DISABLED: Auto-refresh can interrupt question adding process
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
  //     if (timeSinceLastRefresh > 30000) { // 30 seconds
  //       console.log('[usePublicContent] Auto-refreshing data...');
  //       loadData(false);
  //     }
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [loadData]);

  const refreshData = useCallback(async () => {
    console.log('[usePublicContent] Manual refresh requested');
    await loadData(false);
  }, [loadData]);

  return {
    majors,
    subjects,
    isLoading,
    refreshData,
    majorCodeToIdMap
  };
}; 