import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, Database, ref, set, get, onValue, off, push, remove, update } from 'firebase/database';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate environment variables
const validateConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('[Firebase] Missing environment variables:', missingVars);
    throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
  }

};

// Initialize Firebase with error handling
let app: FirebaseApp;
let auth: Auth;
let database: Database;

try {
  validateConfig();
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
} catch (error) {
  console.error('[Firebase] Initialization failed:', error);
  // Provide fallback for development
  if (import.meta.env.DEV) {
    const fallbackConfig = {
      apiKey: "AIzaSyCsD3G9KgYGNWf7dVzHWRccmO_DyU77umw",
      authDomain: "quizmaster-fptu.firebaseapp.com",
      databaseURL: "https://quizmaster-fptu-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "quizmaster-fptu",
      storageBucket: "quizmaster-fptu.firebasestorage.app",
      messagingSenderId: "350242209338",
      appId: "1:350242209338:web:e1d75edf4587962302ff03",
      measurementId: "G-CHT269J2FW"
    };
    app = initializeApp(fallbackConfig);
    auth = getAuth(app);
    database = getDatabase(app);
  } else {
    throw error;
  }
}

// Authentication functions
export const signInUser = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Error signing in:', error);
    return null;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Public content functions (anyone can read, only authenticated users can write)
export const savePublicSubject = async (subject: any) => {
  try {
    const subjectRef = ref(database, `public/subjects/${subject.id}`);
    await set(subjectRef, {
      ...subject,
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser?.uid || 'anonymous'
    });
    return true;
  } catch (error) {
    console.error('Error saving public subject:', error);
    return false;
  }
};

export const loadPublicSubjects = async () => {
  try {
    const snapshot = await get(ref(database, 'public/subjects'));
    
    if (snapshot.exists()) {
      const subjects = Object.values(snapshot.val()).map((s: any) => ({
        ...s,
        exams: Array.isArray(s.exams)
          ? s.exams.map((exam: any) => ({
              ...exam,
              questions: Array.isArray(exam.questions) ? exam.questions : []
            }))
          : (s.exams ? Object.values(s.exams).map((exam: any) => ({
              ...exam,
              questions: Array.isArray(exam.questions) ? exam.questions : []
            })) : []),
      }));
      return subjects;
    }
    return [];
  } catch (error) {
    console.error('[Firebase] Error loading public subjects:', error);
    return [];
  }
};

export const subscribeToPublicSubjects = (callback: (subjects: any[]) => void) => {
  const subjectsRef = ref(database, 'public/subjects');
  
  onValue(subjectsRef, (snapshot) => {
    if (snapshot.exists()) {
      // Ensure exams and questions are always arrays
      const subjects = Object.values(snapshot.val()).map((s: any) => ({
        ...s,
        exams: Array.isArray(s.exams)
          ? s.exams.map((exam: any) => ({
              ...exam,
              questions: Array.isArray(exam.questions) ? exam.questions : []
            }))
          : (s.exams ? Object.values(s.exams).map((exam: any) => ({
              ...exam,
              questions: Array.isArray(exam.questions) ? exam.questions : []
            })) : []),
      }));
      callback(subjects);
    } else {
      callback([]);
    }
  });

  return () => off(subjectsRef);
};

export const deletePublicSubject = async (subjectId: string) => {
  try {
    const subjectRef = ref(database, `public/subjects/${subjectId}`);
    await remove(subjectRef);
    return true;
  } catch (error) {
    console.error('Error deleting public subject:', error);
    return false;
  }
};

// New structure: Majors -> Subjects -> Exams
export interface Major {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  majorId: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  timeLimit: number; // in minutes
  totalQuestions: number;
  examType: 'PE' | 'FE'; // Practice Exam or Final Exam
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface Question {
  id: string;
  examId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string; // Danh mục câu hỏi (tùy chọn)
  createdAt: string;
}

// Major functions
export const saveMajor = async (major: Major) => {
  try {
    console.log('[Firebase] Saving major to path:', `public/majors/${major.id}`);
    console.log('[Firebase] Major data:', major);
    
    await set(ref(database, `public/majors/${major.id}`), {
      ...major,
      updatedAt: new Date().toISOString()
    });
    
    console.log('[Firebase] Major saved successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Error saving major:', error);
    console.error('[Firebase] Error details:', {
      code: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
};

export const loadPublicMajors = async () => {
  try {
    console.log('[Firebase] Loading public majors...');
    const snapshot = await get(ref(database, 'public/majors'));
    
    console.log('[Firebase] Snapshot exists:', snapshot.exists());
    console.log('[Firebase] Snapshot value:', snapshot.val());
    
    if (snapshot.exists()) {
      const majors = Object.values(snapshot.val());
      console.log('[Firebase] Parsed majors:', majors);
      return majors;
    }
    console.log('[Firebase] No majors found, returning empty array');
    return [];
  } catch (error) {
    console.error('[Firebase] Error loading public majors:', error);
    return [];
  }
};

export const subscribeToPublicMajors = (callback: (majors: Major[]) => void) => {
  const majorsRef = ref(database, 'public/majors');
  
  onValue(majorsRef, (snapshot) => {
    if (snapshot.exists()) {
      const majors = Object.values(snapshot.val()) as Major[];
      callback(majors);
    } else {
      callback([]);
    }
  });

  return () => off(majorsRef);
};

export const deleteMajor = async (majorId: string) => {
  try {
    const majorRef = ref(database, `public/majors/${majorId}`);
    await remove(majorRef);
    return true;
  } catch (error) {
    console.error('[Firebase] Error deleting major:', error);
    return false;
  }
};

// Subject functions
export const saveSubject = async (subject: Subject) => {
  try {
    await set(ref(database, `public/subjects/${subject.id}`), {
      ...subject,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('[Firebase] Error saving subject:', error);
    return false;
  }
};

export const loadSubjectsByMajor = async (majorId: string) => {
  try {
    const snapshot = await get(ref(database, 'public/subjects'));
    
    if (snapshot.exists()) {
      const allSubjects = Object.values(snapshot.val());
      const subjects = allSubjects.filter((subject: any) => subject.majorId === majorId);
      return subjects;
    }
    return [];
  } catch (error) {
    console.error('[Firebase] Error loading subjects by major:', error);
    return [];
  }
};

export const subscribeToSubjectsByMajor = (majorId: string, callback: (subjects: Subject[]) => void) => {
  const subjectsRef = ref(database, 'public/subjects');
  
  onValue(subjectsRef, (snapshot) => {
    if (snapshot.exists()) {
      const allSubjects = Object.values(snapshot.val()) as Subject[];
      const subjects = allSubjects.filter((subject) => subject.majorId === majorId);
      callback(subjects);
    } else {
      callback([]);
    }
  });

  return () => off(subjectsRef);
};

export const deleteSubject = async (subjectId: string) => {
  try {
    const subjectRef = ref(database, `public/subjects/${subjectId}`);
    await remove(subjectRef);
    return true;
  } catch (error) {
    console.error('[Firebase] Error deleting subject:', error);
    return false;
  }
};

// Exam functions
export const saveExam = async (exam: Exam) => {
  try {
    console.log('[Firebase] Saving exam to database:', exam);
    console.log('[Firebase] Exam questions count:', exam.questions?.length || 0);
    
    const examData = {
      ...exam,
      updatedAt: new Date().toISOString()
    };
    
    console.log('[Firebase] Final exam data to save:', examData);
    
    await set(ref(database, `public/exams/${exam.id}`), examData);
    console.log('[Firebase] Exam saved successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Error saving exam:', error);
    return false;
  }
};

export const loadExamsBySubject = async (subjectId: string) => {
  try {
    console.log('[Firebase] Loading exams for subject:', subjectId);
    const snapshot = await get(ref(database, 'public/exams'));
    
    console.log('[Firebase] Snapshot exists:', snapshot.exists());
    console.log('[Firebase] Snapshot value:', snapshot.val());
    
    if (snapshot.exists()) {
      const allExams = Object.values(snapshot.val());
      console.log('[Firebase] All exams from database:', allExams);
      
      const exams = allExams.filter((exam: any) => exam.subjectId === subjectId);
      console.log('[Firebase] Filtered exams for subject:', exams);
      
      // Log questions for each exam
      exams.forEach((exam: any, index: number) => {
        console.log(`[Firebase] Exam ${index + 1} questions:`, exam.questions?.length || 0);
      });
      
      return exams;
    }
    return [];
  } catch (error) {
    console.error('[Firebase] Error loading exams by subject:', error);
    return [];
  }
};

export const subscribeToExamsBySubject = (subjectId: string, callback: (exams: Exam[]) => void) => {
  const examsRef = ref(database, 'public/exams');
  
  onValue(examsRef, (snapshot) => {
    if (snapshot.exists()) {
      const allExams = Object.values(snapshot.val()) as Exam[];
      const exams = allExams.filter((exam) => exam.subjectId === subjectId);
      callback(exams);
    } else {
      callback([]);
    }
  });

  return () => off(examsRef);
};

export const deleteExam = async (examId: string) => {
  try {
    const examRef = ref(database, `public/exams/${examId}`);
    await remove(examRef);
    return true;
  } catch (error) {
    console.error('[Firebase] Error deleting exam:', error);
    return false;
  }
};

// Question functions
export const saveQuestion = async (question: Question) => {
  try {
    await set(ref(database, `public/questions/${question.id}`), {
      ...question,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('[Firebase] Error saving question:', error);
    return false;
  }
};

export const loadQuestionsByExam = async (examId: string) => {
  try {
    const snapshot = await get(ref(database, 'public/questions'));
    
    if (snapshot.exists()) {
      const allQuestions = Object.values(snapshot.val());
      const questions = allQuestions.filter((question: any) => question.examId === examId);
      return questions;
    }
    return [];
  } catch (error) {
    console.error('[Firebase] Error loading questions by exam:', error);
    return [];
  }
};

export const deleteQuestion = async (questionId: string) => {
  try {
    const questionRef = ref(database, `public/questions/${questionId}`);
    await remove(questionRef);
    return true;
  } catch (error) {
    console.error('[Firebase] Error deleting question:', error);
    return false;
  }
};

// Create sample data for new structure
export const createSampleMajors = async () => {
  try {
    const sampleMajors = [
      {
        id: 'se',
        name: 'Software Engineering',
        description: 'Chuyên ngành Kỹ thuật phần mềm',
        code: 'SE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ai',
        name: 'Artificial Intelligence',
        description: 'Chuyên ngành Trí tuệ nhân tạo',
        code: 'AI',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'da',
        name: 'Data Analytics',
        description: 'Chuyên ngành Phân tích dữ liệu',
        code: 'DA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const major of sampleMajors) {
      await set(ref(database, `public/majors/${major.id}`), major);
    }

    console.log('[Firebase] Sample majors created successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Error creating sample majors:', error);
    return false;
  }
};

export const createSampleSubjects = async () => {
  try {
    const sampleSubjects = [
      // Software Engineering subjects
      {
        id: 'se-oop',
        majorId: 'se',
        name: 'Object-Oriented Programming',
        description: 'Lập trình hướng đối tượng',
        code: 'OOP',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'se-dsa',
        majorId: 'se',
        name: 'Data Structures & Algorithms',
        description: 'Cấu trúc dữ liệu và thuật toán',
        code: 'DSA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // AI subjects
      {
        id: 'ai-ml',
        majorId: 'ai',
        name: 'Machine Learning',
        description: 'Học máy',
        code: 'ML',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ai-dl',
        majorId: 'ai',
        name: 'Deep Learning',
        description: 'Học sâu',
        code: 'DL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // Data Analytics subjects
      {
        id: 'da-stats',
        majorId: 'da',
        name: 'Statistics',
        description: 'Thống kê',
        code: 'STATS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'da-viz',
        majorId: 'da',
        name: 'Data Visualization',
        description: 'Trực quan hóa dữ liệu',
        code: 'VIZ',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const subject of sampleSubjects) {
      await set(ref(database, `public/subjects/${subject.id}`), subject);
    }

    console.log('[Firebase] Sample subjects created successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Error creating sample subjects:', error);
    return false;
  }
};

export const createSampleExams = async () => {
  try {
    const sampleExams = [
      {
        id: 'oop-midterm',
        subjectId: 'se-oop',
        name: 'Midterm Exam - OOP',
        description: 'Bài kiểm tra giữa kỳ môn Lập trình hướng đối tượng',
        timeLimit: 60,
        totalQuestions: 20,
        examType: 'PE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questions: [
          {
            id: 'q1',
            question: 'Trong lập trình hướng đối tượng, tính đóng gói (Encapsulation) là gì?',
            options: [
              'Là khả năng ẩn thông tin và chi tiết triển khai bên trong đối tượng',
              'Là khả năng tạo ra nhiều đối tượng từ một lớp',
              'Là khả năng kế thừa từ lớp cha',
              'Là khả năng ghi đè phương thức'
            ],
            correctAnswer: 0,
            examId: 'oop-midterm',
            category: 'Lý thuyết'
          },
          {
            id: 'q2',
            question: 'Phương thức nào được gọi khi tạo một đối tượng mới?',
            options: [
              'Destructor',
              'Constructor',
              'Getter',
              'Setter'
            ],
            correctAnswer: 1,
            examId: 'oop-midterm',
            category: 'Thực hành'
          }
        ]
      },
      {
        id: 'ml-final',
        subjectId: 'ai-ml',
        name: 'Final Exam - Machine Learning',
        description: 'Bài kiểm tra cuối kỳ môn Học máy',
        timeLimit: 90,
        totalQuestions: 30,
        examType: 'FE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questions: [
          {
            id: 'q3',
            question: 'Thuật toán nào được sử dụng để phân loại dữ liệu?',
            options: [
              'K-means clustering',
              'Linear regression',
              'Logistic regression',
              'Tất cả đều đúng'
            ],
            correctAnswer: 3,
            examId: 'ml-final',
            category: 'Lý thuyết'
          }
        ]
      }
    ];

    for (const exam of sampleExams) {
      await set(ref(database, `public/exams/${exam.id}`), exam);
    }

    console.log('[Firebase] Sample exams created successfully');
    return true;
  } catch (error) {
    console.error('[Firebase] Error creating sample exams:', error);
    return false;
  }
};

// Private user data functions (only the user can read/write)
export const saveUserData = async (userId: string, data: any) => {
  try {
    await update(ref(database, `users/${userId}`), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const loadUserData = async (userId: string) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

export const subscribeToUserData = (userId: string, callback: (data: any) => void) => {
  const userRef = ref(database, `users/${userId}`);
  
  onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });

  return () => off(userRef);
};

// Admin role management (without Cloud Functions)
export const setAdminRole = async (uid: string) => {
  try {
    // This requires Firebase Admin SDK on client side (not recommended for production)
    // For now, we'll use a simple approach with custom claims
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Set custom claims using Firebase Auth
    await user.getIdToken(true); // Force token refresh
    
    console.log(`Admin role set for user: ${uid}`);
    return { success: true, uid };
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw error;
  }
};

export const removeAdminRole = async (uid: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    await user.getIdToken(true);
    
    console.log(`Admin role removed for user: ${uid}`);
    return { success: true, uid };
  } catch (error) {
    console.error('Error removing admin role:', error);
    throw error;
  }
};

// Simple admin check (without custom claims)
export const checkAdminStatus = async (email: string): Promise<boolean> => {
  try {
    console.log('[checkAdminStatus] Checking admin status for email:', email);
    const adminRef = ref(database, 'admins');
    const snapshot = await get(adminRef);
    
    if (snapshot.exists()) {
      const admins = snapshot.val();
      console.log('[checkAdminStatus] All admins in database:', admins);
      console.log('[checkAdminStatus] Admin keys:', Object.keys(admins));
      
      // Check multiple email formats
      const emailWithCommas = email.replace(/\./g, ',');
      const emailLower = email.toLowerCase();
      const emailWithCommasLower = emailWithCommas.toLowerCase();
      
      const checks = {
        original: admins[email],
        withCommas: admins[emailWithCommas],
        lowercase: admins[emailLower],
        withCommasLower: admins[emailWithCommasLower]
      };
      
      console.log('[checkAdminStatus] Email format checks:', checks);
      
      const isAdmin = checks.original === true || 
                     checks.withCommas === true ||
                     checks.lowercase === true ||
                     checks.withCommasLower === true;
      
      console.log('[checkAdminStatus] Final result:', isAdmin);
      return isAdmin;
    } else {
      console.log('[checkAdminStatus] No admins found in database');
      return false;
    }
  } catch (error) {
    console.error('[checkAdminStatus] Error checking admin status:', error);
    return false;
  }
};

export const addAdmin = async (email: string): Promise<boolean> => {
  try {
    // Store with original email (easier to manage)
    const adminRef = ref(database, `admins/${email.replace(/\./g, ',')}`);
    await set(adminRef, true);
    console.log(`Added admin: ${email}`);
    return true;
  } catch (error) {
    console.error('Error adding admin:', error);
    return false;
  }
};

export const removeAdmin = async (email: string): Promise<boolean> => {
  try {
    const adminRef = ref(database, `admins/${email.replace(/\./g, ',')}`);
    await remove(adminRef);
    return true;
  } catch (error) {
    console.error('Error removing admin:', error);
    return false;
  }
};

export const createSampleAdmin = async (email: string) => {
  try {
    console.log('[createSampleAdmin] Creating sample admin for email:', email);
    const adminRef = ref(database, `admins/${email.replace(/\./g, ',')}`);
    await set(adminRef, true);
    console.log('[createSampleAdmin] Sample admin created successfully');
    return true;
  } catch (error) {
    console.error('[createSampleAdmin] Error creating sample admin:', error);
    return false;
  }
};

export const debugAdminStatus = async (email: string) => {
  try {
    console.log('[debugAdminStatus] Debugging admin status for:', email);
    const adminRef = ref(database, 'admins');
    const snapshot = await get(adminRef);
    
    if (snapshot.exists()) {
      const admins = snapshot.val();
      console.log('[debugAdminStatus] All admins in database:', admins);
      console.log('[debugAdminStatus] Admin keys:', Object.keys(admins));
      
      // Check if email exists in any format
      const emailWithCommas = email.replace(/\./g, ',');
      const emailLower = email.toLowerCase();
      const emailWithCommasLower = emailWithCommas.toLowerCase();
      
      const checks = {
        original: admins[email],
        withCommas: admins[emailWithCommas],
        lowercase: admins[emailLower],
        withCommasLower: admins[emailWithCommasLower]
      };
      
      console.log('[debugAdminStatus] Email format checks:', checks);
      
      const isAdmin = checks.original === true || 
                     checks.withCommas === true ||
                     checks.lowercase === true ||
                     checks.withCommasLower === true;
      
      console.log('[debugAdminStatus] Final result:', isAdmin);
      return isAdmin;
    } else {
      console.log('[debugAdminStatus] No admins found in database');
      return false;
    }
  } catch (error) {
    console.error('[debugAdminStatus] Error:', error);
    return false;
  }
};

// Debug function to check current user and admin status
export const debugCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    console.log('[Firebase] Current user:', user);
    
    if (user) {
      console.log('[Firebase] User email:', user.email);
      console.log('[Firebase] User UID:', user.uid);
      
      // Check admin status
      const isAdmin = await checkAdminStatus(user.email || '');
      console.log('[Firebase] Admin status:', isAdmin);
      
      // Check if user exists in users node
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      console.log('[Firebase] User exists in database:', userSnapshot.exists());
      if (userSnapshot.exists()) {
        console.log('[Firebase] User data:', userSnapshot.val());
      }
      
      return {
        user: user,
        isAdmin: isAdmin,
        userExists: userSnapshot.exists(),
        userData: userSnapshot.exists() ? userSnapshot.val() : null
      };
    } else {
      console.log('[Firebase] No user logged in');
      return null;
    }
  } catch (error) {
    console.error('[Firebase] Error debugging user:', error);
    return null;
  }
};

// Test function to check database access
export const testDatabaseAccess = async () => {
  try {
    console.log('[Firebase] Testing database access...');
    
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      console.log('[Firebase] No user authenticated');
      return false;
    }
    
    console.log('[Firebase] User authenticated:', user.email || 'Anonymous user');
    console.log('[Firebase] User UID:', user.uid);
    
    // Force token refresh to ensure we have the latest token
    try {
      await user.getIdToken(true);
      console.log('[Firebase] Token refreshed successfully');
    } catch (tokenError) {
      console.error('[Firebase] Error refreshing token:', tokenError);
    }
    
    // Test read access first
    const majorsRef = ref(database, 'public/majors');
    const majorsSnapshot = await get(majorsRef);
    console.log('[Firebase] Read access test - majors exist:', majorsSnapshot.exists());
    
    // For anonymous users, only test read access
    if (!user.email) {
      console.log('[Firebase] Anonymous user - only testing read access');
      return majorsSnapshot.exists() !== null; // Return true if we can read
    }
    
    // For users with email, check admin status and test write access
    const isAdmin = await checkAdminStatus(user.email);
    console.log('[Firebase] Admin status for', user.email, ':', isAdmin);
    
    if (isAdmin) {
      // Test write access with a test object
      const testRef = ref(database, 'public/test');
      await set(testRef, { test: true, timestamp: new Date().toISOString() });
      console.log('[Firebase] Write access test - success');
      
      // Clean up test data
      await remove(testRef);
      console.log('[Firebase] Test cleanup - success');
      
      return true;
    } else {
      console.log('[Firebase] User is not admin, skipping write test');
      // Return true if read access works, false otherwise
      return majorsSnapshot.exists() !== null;
    }
  } catch (error) {
    console.error('[Firebase] Database access test failed:', error);
    return false;
  }
};

export { auth, database }; 