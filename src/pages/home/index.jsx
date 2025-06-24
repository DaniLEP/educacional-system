import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer); }, []);

  const cards = [
    {
      id: "register",
      title: "Cadastro Kalunga",
      description: "Cadastre os produtos para alimentar o estoque dos jovens e funcionários",
      icon: (<img src="./kalunga-logo-png.webp" alt="Kalunga" className="h-15 w-auto object-contain" />),
      onClick: () => navigate("/register"),
    },
    {
      id: "users",
      title: "Cadastros de Usuários",
      description: "Gerencie e cadastre os usuários",
      icon: <img src="./novouser.png"className="h-12 w-auto object-contain"/>,
      onClick: () => navigate("/register-user"),
    },
    {
      id: "estoque",
      title: "Estoque Produtos",
      description: "Visualize e gerencie os produtos",
      icon: <img src="./estoque.png" className="h-12 w-auto object-contain"/>, 
      onClick: () => navigate("/estoque"),  
    },
    {
      id: "retiradas",
      title: "Retiradas",
      description: "Retire produtos para consumos dos jovens ou funcionários",
      icon: <img src="./retirada.png" className="h-12 w-auto object-contain"/>,
      onClick: () => navigate("/retiradas"),
    },
    { id: "historico", title: "Históricos de Retiradas",
      description: "Gerencie seus produtos retirados para uso educacionais",
      icon: <img src="./retiradas.png" className="h-12 w-auto object-contain"/>, 
      onClick: () => navigate("/historic-retiradas"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
        <main className="flex-1 p-6">
          {isLoading ? (<div className="text-center text-gray-500 py-20 text-sm">Carregando homepage...</div>) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={card.onClick}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`cursor-pointer bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                    hoveredCard === card.id ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 items-start">
                      <div className="shrink-0">{card.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                        <p className="text-sm text-gray-500">{card.description}</p>
                      </div>
                    </div>
                    {card.isNew && <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    {card.badge && (<Badge className="bg-blue-100 text-blue-700">{card.badge}</Badge>)}
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
