import Header from "../../components/ui/header/index";
import Footer from "../../components/ui/footer/index";
import { useNavigate } from "react-router-dom";
import {  FolderKanban,   User2Icon, SearchCheckIcon } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Cadastro Kalunga", 

      icon: <img src="./kalunga-logo-png.webp" className="w-[120px] h-[100px] text-blue-700" />,
      onClick: () => navigate("/register"),
    },
    {
      title: "Estoque Produtos",
      icon:  <img src="./estoque.png" className="w-[120px] h-[100px] text-blue-700"/>, //className="w-10 h-10 text-red-700" 
      onClick: () => navigate("/estoque"),
    },
    {
      title: "Retiradas",
      icon:  <img src="./retirada.png" className="w-[120px] h-[100px] text-blue-700"/>,
      onClick: () => navigate("/retiradas"),
    },
        {
      title: "Históricos de Retiradas",
      icon:  <img src="./retiradas.png" className="w-[120px] h-[100px] text-blue-700"/>,
      onClick: () => navigate("/historic-retiradas"),
    },
    {
      title: "Cadastros de Usuários",
      icon:  <img src="./novouser.png" className="w-[120px] h-[100px] text-blue-700"/>,
      onClick: () => navigate("/register-user"),
    },

  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <hr />
      <main className="flex-1 p-6 bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div key={idx} onClick={card.onClick}
              className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="flex flex-col items-center justify-center gap-2">
                {card.icon}
                <h2 className="text-lg font-semibold">{card.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </main>
      <hr />
      <Footer />
    </div>
  );
}
