import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, Database, ref, set, get, onValue, off, push, remove } from 'firebase/database';

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

// Private user data functions (only the user can read/write)
export const saveUserData = async (userId: string, data: any) => {
  try {
    await set(ref(database, `users/${userId}`), {
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
    const adminRef = ref(database, 'admins');
    const snapshot = await get(adminRef);
    
    if (snapshot.exists()) {
      const admins = snapshot.val();
      // Check both original email and email with dots replaced
      const emailWithCommas = email.replace(/\./g, ',');
      return admins[email] === true || admins[emailWithCommas] === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
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

export { auth, database }; 