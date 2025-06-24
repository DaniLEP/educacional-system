import { Menu } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../../../firebase";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
       <div className="flex items-center justify-between">
         <div className="flex items-center space-x-4">
           <div className="w-10 h-10  rounded-lg">
            <img src="./Reciclar_LOGO.png" alt="" />
           </div>
           <h1 className="text-xl font-semibold text-gray-900">Instituto Reciclar</h1>
         </div>
         <nav className="hidden md:flex space-x-6">
           <a href="/register" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cadastro Kalunga
           </a> 
           <a href="/register-user" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cadastro Usuários
           </a>
           <a href="/estoque" className="text-gray-600 hover:text-gray-900 transition-colors">
              Estoque
           </a>
           <a href="/retiradas" className="text-gray-600 hover:text-gray-900 transition-colors">
              Retiradas
           </a>
           <a href="/historic-retiradas" className="text-gray-600 hover:text-gray-900 transition-colors">
              Historico Retiradas
           </a>
         </nav>
       </div>
     </header>
  );
}
