import { useEffect, useState } from "react";
import { ref, get, db } from "../../../../firebase";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function HistoricoRetiradas() {
  const [retiradas, setRetiradas] = useState([]);
  const [search, setSearch] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRetiradas = async () => {
      const retiradasRef = ref(db, "Retiradas");
      const snapshot = await get(retiradasRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const lista = Object.entries(data).map(([id, r]) => ({ id, ...r }));
        setRetiradas(lista);
      }
    };
    fetchRetiradas();
  }, []);

  const filtradas = retiradas.filter((r) => {
    const matchProduto = r.produto.toLowerCase().includes(search.toLowerCase()) ||
                         r.sku.toLowerCase().includes(search.toLowerCase());
    const matchResponsavel = responsavel ? r.retirante === responsavel : true;
    const matchData =
      dataInicio && dataFim
        ? new Date(r.dataRetirada) >= new Date(dataInicio) &&
          new Date(r.dataRetirada) <= new Date(dataFim)
        : true;
    return matchProduto && matchResponsavel && matchData;
  });

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("pt-BR");
}
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Histórico de Retiradas</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="flex items-center gap-2 col-span-2">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por produto ou SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <select
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
              className="w-full p-2 border rounded-lg"
          >
            <option value="">Todos os responsáveis</option>
            <option value="Karol">Karol</option>
            <option value="Luciano">Luciano</option>
            <option value="Rafael">Rafael</option>
            <option value="Rita">Rita</option>
          </select>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Produto</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Marca</th>
                <th className="p-2">Quantidade</th>
                <th className="p-2">Responsável</th>
                <th className="p-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-gray-500">Nenhuma retirada encontrada.</td>
                </tr>
              ) : (
                filtradas.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{r.produto}</td>
                    <td className="p-2">{r.sku}</td>
                    <td className="p-2">{r.marca}</td>
                    <td className="p-2">{r.quantidade}</td>
                    <td className="p-2">{r.retirante}</td>
                    <td className="p-2">{formatDate(new Date(r.dataRetirada), "dd/MM/yyyy")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
