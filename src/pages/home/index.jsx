import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../../../firebase";
import { Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { UserType } from "@/routes/userType";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [userType, setUserType] = useState();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchUserType = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `usuarios/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("userData.funcao:", userData.funcao);
          setUserType(userData.funcao || UserType.AUXILIAR);
        } else {
          setUserType(UserType.AUXILIAR);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar nível de acesso:", err);
      setUserType(UserType.AUXILIAR);
    } finally {
      setIsLoading(false);
    }
  };

  fetchUserType();
}, []);


  console.log("userType:", userType);

  const cards = [
    {
      id: "register",
      title: "Cadastro Kalunga",
      description:
        "Cadastre os produtos para alimentar o estoque dos jovens e funcionários",
      icon: (
        <img
          src="./kalunga-logo-png.webp"
          alt="Kalunga"
          className="h-15 w-auto object-contain"
        />
      ),
      onClick: () => navigate("/register"),
      allowedRoles: [UserType.ADMIN, UserType.COORDENADOR],
    },
    {
      id: "users",
      title: "Cadastros de Usuários",
      description: "Gerencie e cadastre os usuários",
      icon: <img src="./novouser.png" className="h-12 w-auto object-contain" />,
      onClick: () => navigate("/register-user"),
      allowedRoles: [UserType.ADMIN],
    },
    {
      id: "estoque",
      title: "Estoque Produtos",
      description: "Visualize e gerencie os produtos",
      icon: <img src="./estoque.png" className="h-12 w-auto object-contain" />,
      onClick: () => navigate("/estoque"),
      allowedRoles: [UserType.ADMIN, UserType.COORDENADOR, UserType.AUXILIAR],
    },
    {
      id: "retiradas",
      title: "Retiradas",
      description: "Retire produtos para consumos dos jovens ou funcionários",
      icon: <img src="./retirada.png" className="h-12 w-auto object-contain" />,
      onClick: () => navigate("/retiradas"),
      allowedRoles: [UserType.AUXILIAR, UserType.COORDENADOR, UserType.ADMIN],
    },
    {
      id: "historico",
      title: "Históricos de Retiradas",
      description: "Gerencie seus produtos retirados para uso educacionais",
      icon: <img src="./retiradas.png" className="h-12 w-auto object-contain" />,
      onClick: () => navigate("/historic-retiradas"),
      allowedRoles: [UserType.AUXILIAR, UserType.COORDENADOR, UserType.ADMIN],
    },
    {
      id: "gestaousers",
      title: "Gestão de Usuários",
      description: "Gerencie seus funcionários de uma forma muito mais rápida",
      icon: <Users className="w-8 h-8" />,
      onClick: () => navigate("/painel-users"),
      allowedRoles: [UserType.ADMIN],
    },
  ];

  const filteredCards = cards.filter(
    (card) => typeof userType === "string" && card.allowedRoles.includes(userType)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header userType={userType} />
      <main className="flex-1 p-6">
        {isLoading ? (
          <div className="text-center text-gray-500 py-20 text-sm">
            Carregando homepage...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                onClick={card.onClick}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`cursor-pointer bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                  hoveredCard === card.id ? "ring-2 ring-blue-500 ring-offset-2" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0">{card.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-500">{card.description}</p>
                    </div>
                  </div>
                  {card.isNew && (
                    <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  {card.badge && (
                    <Badge className="bg-blue-100 text-blue-700">{card.badge}</Badge>
                  )}
                  <span className="text-gray-500">{card.stats}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
