import { signOut } from "firebase/auth";
import { auth } from "../../../../firebase";
import { useNavigate } from "react-router-dom";
import { UserType } from "@/routes/userType";

export default function Header({ userType }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/"));
  };

  if (!userType) {
    // Renderiza header básico enquanto userType carrega ou é indefinido
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg">
              <img src="./Reciclar_LOGO.png" alt="Logo" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Instituto Reciclar</h1>
          </div>
          <nav className="text-gray-500">Carregando...</nav>
        </div>
      </header>
    );
  }

  const canAccess = (allowedRoles) => allowedRoles.includes(userType);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg">
            <img src="./Reciclar_LOGO.png" alt="Logo" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Instituto Reciclar</h1>
        </div>

        <nav className="hidden md:flex space-x-6">
          {canAccess([UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR]) && (
            <a href="/register" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cadastro Kalunga
            </a>
          )}
          {canAccess([UserType.ADMIN]) && (
            <a href="/register-user" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cadastro Usuários
            </a>
          )}
          {canAccess([UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR]) && (
            <a href="/estoque" className="text-gray-600 hover:text-gray-900 transition-colors">
              Estoque
            </a>
          )}
          {canAccess([UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR]) && (
            <a href="/retiradas" className="text-gray-600 hover:text-gray-900 transition-colors">
              Retiradas
            </a>
          )}
          {canAccess([UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR]) && (
            <a href="/historic-retiradas" className="text-gray-600 hover:text-gray-900 transition-colors">
              Histórico Retiradas
            </a>
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
