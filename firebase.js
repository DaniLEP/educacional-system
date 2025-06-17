import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, update, off} from "firebase/database"; // ou getFirestore se usar Firestore



// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);
export { auth, provider, db, app, off, update, createUserWithEmailAndPassword };
