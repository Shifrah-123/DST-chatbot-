
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_rtDuD_xUYJYOSUutUdHN519lkz6GtHQ",
  authDomain: "dst-chatbot.firebaseapp.com",
  projectId: "dst-chatbot",
  storageBucket: "dst-chatbot.firebasestorage.app",
  messagingSenderId: "980449606457",
  appId: "1:980449606457:web:ae96efecf8901f87b846e8",
  measurementId: "G-F5K4N4P4FS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
