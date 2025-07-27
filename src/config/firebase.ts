import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsD3G9KgYGNWf7dVzHWRccmO_DyU77umw",
  authDomain: "quizmaster-fptu.firebaseapp.com",
  databaseURL: "https://quizmaster-fptu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quizmaster-fptu",
  storageBucket: "quizmaster-fptu.firebasestorage.app",
  messagingSenderId: "350242209338",
  appId: "1:350242209338:web:e1d75edf4587962302ff03",
  measurementId: "G-CHT269J2FW"
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

// Database functions
export const saveUserData = async (userId: string, data: any) => {
  try {
    await set(ref(database, `users/${userId}`), {
      ...data,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
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
    console.error('Error loading data:', error);
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

  // Return unsubscribe function
  return () => off(userRef);
};

export { auth, database }; 