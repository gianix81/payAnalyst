import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqDyPwhqUQ6kqcbyBdXSrq0D09S7aEw5c",
  authDomain: "gioia-e1f29.firebaseapp.com",
  projectId: "gioia-e1f29",
  storageBucket: "gioia-e1f29.appspot.com",
  messagingSenderId: "861462463075",
  appId: "1:861462463075:web:39be7494eb9c85d9342e56"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta i servizi di Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Esporta le funzioni di auth per un uso più semplice
export { onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail };