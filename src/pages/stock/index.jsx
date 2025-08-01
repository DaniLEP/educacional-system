import { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { app } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";

const STATUS_OPTIONS = [ { value: "Novo", label: "Novo" }, { value: "Aberto", label: "Aberto" }, { value: "Vencido", label: "Vencido" }];

  // Formatar data sem shift de fuso
  const formatDate = (date) => {
    if (!date) return "--";
    const [y, m, d] = date.slice(0, 10).split("-");
    const dt = new Date(Date.UTC(+y, +m - 1, +d));
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = dt.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

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
    const arr = Object.entries(data).map(([id, v]) => ({id, ...v, status: v.status || "", motivo: v.motivo || "",}));
      setNotebooks(arr);});
    return () => unsubscribe(); }, []);

  const abrirModal = (item) => {setSelecionado(item); setModalAberto(true);};
  const fecharModal = () => {setModalAberto(false); setSelecionado(null);};
  const fecharMotivo = () => {setModalMotivo(false); setMotivo("");};
  const atualizarFirebase = async (id, status, motivoTexto) => {
    try {const db = getDatabase(app);
      await update(ref(db, `Estoque/${id}`), {status, motivo: motivoTexto,});} 
    catch (e) {console.error("Erro ao atualizar o estoque:", e); }
  };

  const alterarStatus = (novo) => {
    if (!selecionado) return;
    if (["Novo", "Aberto", "Vencido"].includes(novo)) {
      setStatusNovo(novo);
      setModalMotivo(true);} 
    else {
      const atualizado = { ...selecionado, status: novo, motivo: "" };
      setSelecionado(atualizado);
      atualizarFirebase(selecionado.id, novo, "");
      setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)));
    }
  };

  const salvarMotivo = () => {
    if (!selecionado || !motivo.trim()) return;
    const atualizado = {...selecionado, status: statusNovo, motivo: motivo.trim()};
    setSelecionado(atualizado);
    atualizarFirebase(selecionado.id, statusNovo, motivo.trim());
    setNotebooks((old) => old.map((n) => (n.id === selecionado.id ? atualizado : n)));
    setModalMotivo(false);
    setMotivo("");
  };

  const produtosFiltrados = useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return notebooks.filter(({ marca, produto, sku, status }) => {const textoOk = (produto?.toLowerCase() || "").includes(filtroLower) || (marca?.toLowerCase() || "").includes(filtroLower) || 
      (sku?.toLowerCase() || "").includes(filtroLower);
        const statusOk = !filtroStatus || status === filtroStatus;
        return textoOk && statusOk;
      }).sort((a, b) => a.produto?.localeCompare(b.produto));}, [filtro, filtroStatus, notebooks]);

  const contagem = useMemo(() => {
    const cnt = { Novo: 0, Aberto: 0, Vencido: 0};
    notebooks.forEach((n) => {if (cnt[n.status] >= 0) cnt[n.status]++;});
    return cnt; }, [notebooks]);
  const voltarPagina = () => navigate("/home");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-x-auto" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Voltar + Título */}
        <div className="flex justify-end mb-2">
          <button onClick={voltarPagina} aria-label="Voltar para página inicial"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-400 font-semibold transition"><ArrowLeft size={18} /> Voltar </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-4">
            <img src="./kalunga-logo-png.webp" alt="Logo Kalunga" className="h-16 sm:h-20 object-contain"/>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700"> Estoque KaLunga</h2>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <input type="text" placeholder="Pesquisar por produto, sku e marca..."  value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtro de pesquisa"
            className="w-full md:flex-1 p-3 rounded border focus:ring-2 focus:ring-indigo-600 focus:outline-none transition"/>
          <select className="w-full md:w-60 p-3 border rounded focus:ring-2 focus:ring-indigo-600 focus:outline-none transition"
            value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} aria-label="Filtro de status">
            <option value="">Todos os Status</option>
            {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>

        {/* Contagem de status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {Object.entries(contagem).map(([key, value]) => (
            <div key={key}
              className={`p-3 text-center rounded shadow text-sm font-semibold select-none ${
                {Novo: "bg-green-100 text-green-800", Aberto: "bg-yellow-100 text-yellow-800", Vencido: "bg-red-100 text-red-800" }[key] || "bg-gray-100 text-gray-800"
              }`} aria-label={`Quantidade de itens com status ${key}`}>{key}: {value}
            </div>
          ))}
        </div>

        {/* Tabela com scroll horizontal */}
        <div className="overflow-x-auto rounded-md shadow-sm">
          {produtosFiltrados.length === 0 ? (<p className="text-center text-gray-600 py-6">Nenhum produto encontrado no estoque.</p>) : (
            <table className="min-w-full text-sm border table-auto">
              <thead className="bg-gray-100 text-gray-700">
                <tr>{["SKU", "Marca", "Produto", "Quantidade", "Local", "Data de Validade", "Status", "Observações", "Ações"].map((h) => (
                  <th key={h} className="p-2 border text-center whitespace-nowrap" scope="col">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border text-center whitespace-nowrap">{item.sku || "-"}</td>
                    <td className="p-2 border text-center whitespace-nowrap">{item.produto || "-"}</td>
                    <td className="p-2 border text-center whitespace-nowrap">{item.marca || "-"}</td>
                    <td className="p-2 border text-center whitespace-nowrap">{item.quantidade ?? "-"}</td>
                    <td className="p-2 border text-center whitespace-nowrap">{item.local || "-"}</td>
                    <td className="p-2 border text-center whitespace-nowrap">{item.dataValidade ? formatDate(item.dataValidade) : "-"}</td>
                    <td className="p-2 border text-center whitespace-nowrap"> <span className={`inline-block px-2 py-1 rounded text-xs font-semibold select-text ${
                          item.status === "Novo" ? "bg-green-200 text-green-800" : item.status === "Aberto" ? "bg-yellow-200 text-yellow-800" 
                          : item.status === "Vencido" ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-800"}`}title={item.motivo || ""}
                        aria-label={`Status: ${item.status}${item.motivo ? `, motivo: ${item.motivo}` : ""}`}>{item.status || "-"}</span>
                    </td>
                    <td className="p-2 border text-center whitespace-nowrap">{item.obs || "-"}</td>
                    <td className="p-2 border text-center whitespace-nowrap">
                      <button onClick={() => abrirModal(item)}     aria-label={`Ver detalhes do produto ${item.produto}`}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400">Ver Mais</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {modalAberto && selecionado && (
          <motion.div  className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-modal="true" role="dialog" aria-labelledby="modal-title">
            <motion.div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative p-6 sm:p-8"
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <button onClick={fecharModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none" aria-label="Fechar modal"><X size={24} /></button>
              <h3 id="modal-title" className="text-center text-indigo-700 text-3xl font-semibold mb-6 select-none">Detalhes do Produto</h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm select-text">
                  {[["SKU", selecionado.sku], ["Produto", selecionado.produto], ["Marca", selecionado.marca], ["Quantidade", selecionado.quantidade], ["Local", selecionado.local],
                    ["Data de Vencimento", formatDate(selecionado.dataValidade)]].map(([label, value]) => (
                  <p key={label}> <strong>{label}:</strong> {value || "-"}</p>))}
                  <p className="sm:col-span-2">
                    <strong>Status:</strong>{" "}
                    <span className={`ml-2 inline-block px-2 py-1 rounded text-xs font-semibold select-text ${ selecionado.status === "Novo" ? "bg-green-200 text-green-800" : selecionado.status === "Aberto" ? "bg-yellow-200 text-yellow-800"
                      : selecionado.status === "Vencido"? "bg-red-200 text-red-800" : "bg-blue-200 text-blue-800"}`}title={selecionado.motivo}>{selecionado.status || "-"}</span></p>
                  {selecionado.motivo && (<p className="sm:col-span-2"><strong>Motivo:</strong> {selecionado.motivo} </p>)}
                  <p className="sm:col-span-2"><strong>Observações:</strong> {selecionado.obs || "-"}</p>
                </div>
              </div>

              <div className="mt-8">
                <label htmlFor="status-select" className="block font-medium mb-2 select-none">Alterar Status</label>
                <select id="status-select" value={selecionado.status} onChange={(e) => alterarStatus(e.target.value)} aria-label="Alterar status do produto"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none transition">
                  {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option> ))}
                </select>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal do motivo */}
      <AnimatePresence>
        {modalMotivo && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-modal="true" role="dialog" aria-labelledby="modal-motivo-title">
            <motion.div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <button onClick={fecharMotivo} className="absolute top-3 right-3 text-gray-500 hover:text-black focus:outline-none" aria-label="Fechar modal motivo"><X size={20} /></button>
              <h3 id="modal-motivo-title" className="text-xl text-red-700 font-bold mb-4 select-none">Informe o motivo da alteração</h3>
              <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Digite o motivo..."
                className="w-full h-28 p-3 border rounded focus:ring-2 focus:ring-red-500 resize-none focus:outline-none transition" aria-label="Texto do motivo da alteração" />
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={fecharMotivo}
                  className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition">Cancelar</button>
                <button onClick={salvarMotivo}
                  className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition">Salvar</button>
              </div>
            </motion.div>
          </motion.div>
          )
        }
      </AnimatePresence>
    </div>
  );
}
