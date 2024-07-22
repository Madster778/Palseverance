import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCfyVsZ9QunKDSjpaOUKZ01vTFv9Q5lbEs",
  authDomain: "palseverance-y3project.firebaseapp.com",
  projectId: "palseverance-y3project",
  storageBucket: "palseverance-y3project.appspot.com",
  messagingSenderId: "792104178872",
  appId: "1:792104178872:web:e933d7d0be2a71b729104d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Export the auth and Firestore instance
export { auth, db };