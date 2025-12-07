import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: "nhalinhtinh-56f89.firebaseapp.com",
  databaseURL: "https://nhalinhtinh-56f89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nhalinhtinh-56f89",
  storageBucket: "nhalinhtinh-56f89.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
