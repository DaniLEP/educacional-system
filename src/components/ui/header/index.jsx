"use client";

import { signOut } from "firebase/auth";
import { auth } from "../../../../firebase";
import { useNavigate, Link } from "react-router-dom";
import { UserType } from "@/routes/userType";

export default function Header({ userType }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Enquanto o tipo de usuário ainda está sendo carregado
  if (!userType) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src="/Reciclar_LOGO.png" alt="Logo" className="object-cover w-full h-full" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Instituto Reciclar</h1>
          </div>
          <nav className="text-gray-500">Carregando...</nav>
        </div>
      </header>
    );
  }

  const canAccess = (rolesPermitidos) => rolesPermitidos.includes(userType);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo e título */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <img src="/Reciclar_LOGO.png" alt="Logo" className="object-cover w-full h-full" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Instituto Reciclar</h1>
        </div>

        {/* Navegação */}
        <nav className="hidden md:flex space-x-6 items-center">
          {canAccess([UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR]) && (
            <Link to="/register" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cadastro Kalunga
            </Link>
          )}
          {canAccess([UserType.ADMIN]) && (
            <Link to="/register-user" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cadastro Usuários
            </Link>
          )}
          {canAccess([UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR]) && (
            <Link to="/estoque" className="text-gray-600 hover:text-gray-900 transition-colors">
              Estoque
            </Link>
          )}
          {canAccess([UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR]) && (
            <Link to="/retiradas" className="text-gray-600 hover:text-gray-900 transition-colors">
              Retiradas
            </Link>
          )}
          {canAccess([UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR]) && (
            <Link to="/historic-retiradas" className="text-gray-600 hover:text-gray-900 transition-colors">
              Histórico Retiradas
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 transition-colors font-medium"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
