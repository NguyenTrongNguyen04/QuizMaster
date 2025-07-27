import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getDatabase, ref, set, get, onValue, off, push, remove } from 'firebase/database';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

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
      return Object.values(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error loading public subjects:', error);
    return [];
  }
};

export const subscribeToPublicSubjects = (callback: (subjects: any[]) => void) => {
  const subjectsRef = ref(database, 'public/subjects');
  
  onValue(subjectsRef, (snapshot) => {
    if (snapshot.exists()) {
      const subjects = Object.values(snapshot.val());
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

export { auth, database }; 