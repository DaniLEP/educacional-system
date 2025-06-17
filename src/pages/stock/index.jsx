import { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "Novo", label: "Novo" },
  { value: "Aberto", label: "Aberto" },
  { value: "Vencido", label: "Vencido" },
];

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("pt-BR");
}

export default function Estoque() {
  const [notebooks, setNotebooks] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [modalMotivo, setModalMotivo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [statusNovo, setStatusNovo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDatabase(app);
    const refNotebooks = ref(db, "Estoque");
    const unsubscribe = onValue(refNotebooks, (snap) => {
      const data = snap.val() || {};
      const arr = Object.entries(data).map(([id, v]) => ({
        id,
        ...v,
        status: v.status || "",
        motivo: v.motivo || "",
      }));
      setNotebooks(arr);
    });
    return () => unsubscribe();
  }, []);

  const abrirModal = (item) => {
    setSelecionado(item);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setSelecionado(null);
  };

  const fecharMotivo = () => {
    setModalMotivo(false);
    setMotivo("");
  };

  const atualizarFirebase = async (id, status, motivoTexto) => {
    try {
      const db = getDatabase(app);
      await update(ref(db, `Estoque/${id}`), {
        status,
        motivo: motivoTexto,
      });
    } catch (e) {
      console.error("Erro ao atualizar o estoque:", e);
    }
  };

  const alterarStatus = (novo) => {
    if (!selecionado) return;

    if (["Novo", "Aberto", "Vencido"].includes(novo)) {
      setStatusNovo(novo);
      setModalMotivo(true);
    } else {
      const atualizado = { ...selecionado, status: novo, motivo: "" };
      setSelecionado(atualizado);
      atualizarFirebase(selecionado.id, novo, "");
      setNotebooks((old) =>
        old.map((n) => (n.id === selecionado.id ? atualizado : n))
      );
    }
  };

  const salvarMotivo = () => {
    if (!selecionado || !motivo.trim()) return;
    const atualizado = {
      ...selecionado,
      status: statusNovo,
      motivo: motivo.trim(),
    };
    setSelecionado(atualizado);
    atualizarFirebase(selecionado.id, statusNovo, motivo.trim());
    setNotebooks((old) =>
      old.map((n) => (n.id === selecionado.id ? atualizado : n))
    );
    setModalMotivo(false);
    setMotivo("");
  };

  const produtosFiltrados = useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return notebooks
      .filter(({ marca, produto, sku, status }) => {
        const textoOk =
          (produto?.toLowerCase() || "").includes(filtroLower) ||
          (marca?.toLowerCase() || "").includes(filtroLower) ||
          (sku?.toLowerCase() || "").includes(filtroLower);
        const statusOk = !filtroStatus || status === filtroStatus;
        return textoOk && statusOk;
      })
      .sort((a, b) => a.produto?.localeCompare(b.produto));
  }, [filtro, filtroStatus, notebooks]);

  const contagem = useMemo(() => {
    const cnt = {
      Novo: 0,
      Aberto: 0,
      Vencido: 0,
    };
    notebooks.forEach((n) => {
      if (cnt[n.status] >= 0) cnt[n.status]++;
    });
    return cnt;
  }, [notebooks]);

  const voltarPagina = () => navigate("/home");
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <motion.div
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 overflow-x-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Voltar + Título */}
        <div className="flex justify-end mt-[-10]">
          <button
            onClick={voltarPagina}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-400 font-semibold"
          >
            <ArrowLeft /> Voltar
          </button>
        </div>
  <div className="flex items-center gap-4 mb-5">
  <img 
    src="./kalunga-logo-png.webp" 
    alt="Logo Kalunga" 
    className="h-20 object-contain" // h-20 = 80px
  />
  <h2 className="text-3xl font-bold text-blue-700">Estoque KaLunga</h2>
</div>

        {/* Filtros */}
        <input
          type="text"
          placeholder="Pesquisar por produto, sku e marca..."
          className="w-full mb-4 p-3 rounded border focus:ring-2 focus:ring-indigo-600"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <select
          className="mb-4 p-2 border rounded focus:ring-2 focus:ring-indigo-600"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os Status</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Contagem */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(contagem).map(([key, value]) => (
            <div
              key={key}
              className={`p-2 flex-1 text-center rounded ${
                {
                  Novo: "bg-green-100",
                  Aberto: "bg-yellow-100",
                  Quebrado: "bg-red-100",
                }[key] || "bg-gray-200"
              }`}
            >
              {key}: {value}
            </div>
          ))}
        </div>

        {/* Tabela */}
        {produtosFiltrados.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum produto encontrado no estoque.</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "sku",
                  "produto",
                  "Marca",
                  "quantidade",
                  "Local",
                  "dataValidade",
                  "Status",
                  "Observações",
                  "Ações",

                ].map((h) => (
                  <th key={h} className="p-2 border text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
         <tbody>
  {produtosFiltrados.map((item) => (
    <tr key={item.id} className="hover:bg-gray-50">
      <td className="p-2 border text-center">{item.sku || "-"}</td>
      <td className="p-2 border text-center">{item.produto || "-"}</td>
      <td className="p-2 border text-center">{item.marca || "-"}</td>
      <td className="p-2 border text-center">{item.quantidade ?? "-"}</td>
      <td className="p-2 border text-center">{item.local || "-"}</td>
      <td className="p-2 border text-center">
        {item.dataValidade ? formatDate(item.dataValidade) : "-"}
      </td>

      <td className="p-2 border text-center">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            item.status === "Novo"
              ? "bg-green-200 text-green-800"
              : item.status === "Aberto"
              ? "bg-yellow-200 text-yellow-800"
              : item.status === "Vencido"
              ? "bg-red-200 text-red-800"
              : "bg-gray-200 text-gray-800"
          }`}
          title={item.motivo || ""}
        >
          {item.status || "-"}
        </span>
      </td>
            <td className="p-2 border text-center">{item.obs || "-"}</td>

      <td className="p-2 border text-center">
        <button
          onClick={() => abrirModal(item)}
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200"
        >
          Ver Mais
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        )}
      </motion.div>

      {/* Modal de detalhes */}
<AnimatePresence>
  {modalAberto && selecionado && (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative p-6"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <button
          onClick={fecharModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          aria-label="Fechar modal"
        >
          <X />
        </button>

        <h3 className="text-center text-indigo-700 text-3xl font-semibold mb-6">
          Detalhes do Produto
        </h3>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 text-sm">
            {[
              ["SKU", selecionado.sku],
              ["Produto", selecionado.produto],
              ["Marca", selecionado.marca],
              ["Quantidade", selecionado.quantidade],
              ["Local", selecionado.local],
              ["Data de Vencimento", formatDate(selecionado.dataValidade)],
            ].map(([label, value]) => (
              <p key={label}>
                <strong>{label}:</strong> {value || "-"}
              </p>
            ))}

            <p className="sm:col-span-2">
              <strong>Status:</strong>{" "}
              <span
                className={`ml-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                  selecionado.status === "Novo"
                    ? "bg-green-200 text-green-800"
                    : selecionado.status === "Aberto"
                    ? "bg-yellow-200 text-yellow-800"
                    : selecionado.status === "Vencido"
                    ? "bg-red-200 text-red-800"
                    : "bg-blue-200 text-blue-800"
                }`}
                title={selecionado.motivo}
              >
                {selecionado.status || "-"}
              </span>
            </p>

            {selecionado.motivo && (
              <p className="sm:col-span-2">
                <strong>Motivo:</strong> {selecionado.motivo}
              </p>
            )}

            <p className="sm:col-span-2">
              <strong>Observações:</strong> {selecionado.obs || "-"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <label className="block font-medium mb-2">Alterar Status</label>
          <select
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-600"
            value={selecionado.status}
            onChange={(e) => alterarStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      {/* Modal do motivo */}
      <AnimatePresence>
        {modalMotivo && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
            >
              <button
                onClick={fecharMotivo}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                <X />
              </button>
              <h3 className="text-xl text-red-700 font-bold mb-4">
                Informe o motivo da alteração
              </h3>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Digite o motivo..."
                className="w-full h-28 p-2 border rounded focus:ring-2 focus:ring-red-500 resize-none"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={fecharMotivo}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarMotivo}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
