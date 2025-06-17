import { useState } from "react";
import { getDatabase, ref, push } from "firebase/database";
import { app } from "../../../firebase";
import { motion } from "framer-motion";
import { Save, ArrowLeft, PaperclipIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CadastroKalunga() {
  const [form, setForm] = useState({
    produto: "",
    sku: "",
    marca: "",
    quantidade: "",
    local: "",
    obs: "",
    dataValidade: "",
    status: "",
  });

  const navigate = useNavigate();

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

 async function handleSubmit(e) {
  e.preventDefault();

  const camposVazios = Object.entries(form).some(([_, valor]) => valor.trim() === "");

  if (camposVazios) {
    toast.error("Preencha todos os campos!");
    return;
  }

  const db = getDatabase(app);
  const notebookRef = ref(db, "Estoque");

  try {
    await push(notebookRef, form);
    toast.success("Notebook cadastrado com sucesso!");
    setForm({
      produto: "",
      sku: "",
      marca: "",
      quantidade: "",
      local: "",
      obs: "",
      dataValidade: "",
      status: "",
    });
  } catch (error) {
    toast.error("Erro ao cadastrar: " + error.message);
  }
}


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-10"
        initial={{ opacity: 0, y: 40, rotateZ: 10 }}
        animate={{ opacity: 1, y: 0, rotateZ: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}
      >
        <header className="flex items-center gap-3 mb-8">
          <PaperclipIcon className="w-7 h-7 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">Cadastro KaLunga</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[ 
            { label: "SKU", name: "sku" },
            { label: "Produto", name: "produto" },
            { label: "Marca", name: "marca" },
            { label: "Quantidade", name: "quantidade" },
            { label: "Local", name: "local" },
            { label: "Observações", name: "obs" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block text-gray-700 font-medium mb-1">{label}</label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          ))}

          <div>
            <label className="block text-gray-700 font-medium mb-1">Data de Validade</label>
            <input
              type="date"
              name="dataValidade"
              value={form.dataValidade}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Status do Produto</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Selecione o status</option>
              <option value="Novo">Novo</option>
              <option value="Aberto">Aberto</option>
              <option value="Vencido">Vencido</option>
            </select>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition"
          >
            <Save className="w-5 h-5" />
            Cadastrar Produtos
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => navigate("/home")}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg text-sm shadow-md transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </motion.button>
        </form>

        <ToastContainer position="top-right" autoClose={3000} />
      </motion.div>
    </div>
  );
}
