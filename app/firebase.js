// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-LA7qgWkCiHsgzvhxBI7A0R8vlIQppdQ",
  authDomain: "pantry-tracker-f951b.firebaseapp.com",
  projectId: "pantry-tracker-f951b",
  storageBucket: "pantry-tracker-f951b.appspot.com",
  messagingSenderId: "699077744722",
  appId: "1:699077744722:web:0f0aac9f8503d5cecca78b"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);