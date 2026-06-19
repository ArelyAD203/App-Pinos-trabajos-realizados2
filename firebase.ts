import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { WorkEntry } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Data migration helpers (could be used to load initial constants and move them to firestore)
// But to keep it simple, we listen to firestore and provide helper methods
export { db, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc };
