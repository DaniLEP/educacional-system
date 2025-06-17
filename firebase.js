// firebase.js
import { initializeApp } from "firebase/app";
import {  getAuth, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, update, off, get, push, ref, remove } from "firebase/database";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7eniB3_IFT8E-Tb1VkfktcWUsfLRRYXw",
  authDomain: "bancoreciclar.firebaseapp.com",
  databaseURL: "https://bancoreciclar-default-rtdb.firebaseio.com",
  projectId: "bancoreciclar",
  storageBucket: "bancoreciclar.appspot.com", // ⚠️ Corrigido domínio do storageBucket
  messagingSenderId: "418801320354",
  appId: "1:418801320354:web:3f854deb9e2dda520732fb"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
// Autenticação
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// Banco de Dados (Realtime Database)
const db = getDatabase(app);
//  Exportar serviços Firebase
export { app, auth, provider, db, update, off, createUserWithEmailAndPassword,  ref, get, push, remove };
