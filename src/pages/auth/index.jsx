import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const loginEmailSenha = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;
      const db = getDatabase();
      const userRef = ref(db, `usuarios/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        toast.success('Login bem-sucedido!');
        navigate('/Home');
      } else {
        toast.error('Usuário não autorizado');
        auth.signOut();
      }
    } catch (err) {
      toast.error('Email ou senha inválidos');
    }
  };

  const redefinirSenha = async () => {
    if (!email) return toast.warning('Digite seu e-mail para redefinir');
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Link de redefinição enviado para seu e-mail');
    } catch {
      toast.error('Erro ao enviar e-mail');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-blue-900 p-5">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-sm text-center">
        <img src="/Reciclar_LOGO.png" alt="Logo" className="w-24 mx-auto mb-6" />
        <h2 className="text-xl font-bold text-gray-800 mb-6">Instituto Reciclar - Educacional</h2>
        
        <form onSubmit={loginEmailSenha} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full p-3 pr-10 rounded border border-gray-300 bg-gray-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 pr-10 rounded border border-gray-300 bg-gray-50"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-br from-purple-700 to-blue-800 text-white font-semibold hover:from-pink-500 hover:to-purple-700 transition duration-300 mb-3"
          >
            Acessar Plataforma
          </button>
        </form>
        <button onClick={redefinirSenha} className="w-full mt-2 text-sm text-blue-600 hover:underline">
          Esqueci minha senha
        </button>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}
