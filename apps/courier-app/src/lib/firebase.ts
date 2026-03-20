import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCHVh74WUSx-5DCmo_bISkPdcMVKaHqIdo",
  authDomain: "auryx-company.firebaseapp.com",
  projectId: "auryx-company",
  storageBucket: "auryx-company.firebasestorage.app",
  messagingSenderId: "211761445544",
  appId: "1:211761445544:web:bdd61cab98610bdada209d" // Note: This is an expo/courier specific appId according to .env
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
