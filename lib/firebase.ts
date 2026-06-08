import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6_A11_JRHFsZF9pzQ5LacilMUWnqqSJw",
  authDomain: "warehouse-azizgardy.firebaseapp.com",
  projectId: "warehouse-azizgardy",
  storageBucket: "warehouse-azizgardy.firebasestorage.app",
  messagingSenderId: "142292243105",
  appId: "1:142292243105:web:133fced9c31af4beec16e0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
