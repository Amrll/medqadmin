import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { User } from "../types";
import { initializeAuth } from 'firebase/auth'; // Remove getReactNativePersistence import
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ-geiv5zfCyRm1P4EoCg6rqMLeFIrgGo",
  authDomain: "medq-60a96.firebaseapp.com",
  projectId: "medq-60a96",
  storageBucket: "medq-60a96.appspot.com",
  messagingSenderId: "884846015619",
  appId: "1:884846015619:web:520573143197a57825d7b6",
  measurementId: "G-SZ0HFMQGR1"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const storage = getStorage(FIREBASE_APP);

// Initialize Firebase Auth without persistence
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP);

// Define a function to fetch user data by ID from Firestore
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(FIRESTORE_DB, 'users', userId);
    const userDocSnapshot: DocumentSnapshot<User> = await getDoc<User>(userDocRef);
    
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      return userData;
    } else {
      console.log("User document does not exist.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
