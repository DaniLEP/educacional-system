import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, db } from '../../../../firebase'; 
import { ref, set } from "firebase/database"; 
import { Input } from '@/components/ui/input/input';
import { motion } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegistroUser() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (senha) => senha.length >= 6;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return toast.warning('E-mail inválido.');
    if (!validatePassword(senha)) return toast.warning('A senha deve ter pelo menos 6 caracteres.');
    if (senha !== confirmSenha) return toast.warning('As senhas não coincidem.');
    if (!funcao) return toast.warning('Selecione uma função.');

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha); 
      const newUser = userCredential.user;

      const tipoUsuario =
        funcao === 'Diretor' ? 'Diretor' :
        funcao === 'Coordenador' ? 'Coordenador' :
        funcao === 'Admin' ? 'Admin' :
        'Auxiliar';

      await set(ref(db, 'usuarios/' + newUser.uid), {
        nome,
        email,
        funcao: tipoUsuario,
        uid: newUser.uid,
      });

      toast.success('Usuário criado com sucesso!');
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está em uso.');
      } else {
        toast.error(`Erro: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-6xl">
        <h2 className="text-[40px] font-bold text-center text-gray-700 mb-4">Registro de Novo Usuário</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <Input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Nome" 
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="E-mail" 
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          
          <select value={funcao} onChange={(e) => setFuncao(e.target.value)} required 
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Selecione a função</option>
            <option value="Coordenador">Coordenador Pedagógico</option>
            <option value="Diretor">Diretor Educacional</option>
            <option value="Auxiliar">Auxiliar Educacional</option>
            <option value="Admin">Administrador</option>
          </select>
          
          <Input type={'password'} value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="Digite uma senha" 
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          
          <Input type={'password'} value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} required placeholder="Confirmar Senha" 
            className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-sm shadow-md transition">
                {isLoading ? 'Carregando...' : 'Criar Conta'}
            </motion.button>

            <Link to="/Home">
              <motion.button whileTap={{ scale: 0.97 }} type="button"
                className="flex items-center justify-center gap-2 w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-sm shadow-md transition">Voltar</motion.button>
            </Link>
          </div>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}
