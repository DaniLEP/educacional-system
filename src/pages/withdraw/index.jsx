import { useState, useEffect } from "react";
import { ref, get, push, update, remove, db } from "../../../firebase.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

export default function Retirada() {
  const navigate = useNavigate();

  const [sku, setSku] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [marca, setMarca] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [retirante, setRetirante] = useState("");
  const [local, setLocal] = useState("");
  const [estoque, setEstoque] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split("T")[0]);

  const calcularDiasParaValidade = (dataValidade) => {
    if (!dataValidade) return Infinity;
    const now = new Date();
    const validade = new Date(dataValidade);
    const diff = validade - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const produtosRef = ref(db, "Estoque");
        const snapshot = await get(produtosRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const produtosList = Object.entries(data).map(([id, produto]) => ({
            id,
            ...produto,
            validadeStatus: calcularDiasParaValidade(produto.dataValidade)
          }));
          setEstoque(produtosList);
          setFilteredProdutos(produtosList);

          const alertaValidade = produtosList.some((p) => p.validadeStatus <= 7);
          if (alertaValidade) {
            toast.warn("Atenção: Existem produtos próximos do vencimento!", {
              position: "top-right",
              autoClose: 7000,
              pauseOnHover: true,
              closeOnClick: true,
              draggable: true
            });
          }
        } else {
          setEstoque([]);
          setFilteredProdutos([]);
        }
      } catch (error) {
        toast.error("Erro ao buscar produtos.");
        console.error(error);
      }
    };

    fetchProdutos();
  }, []);

  useEffect(() => {
    const termo = searchTerm.toLowerCase();
    const resultado = estoque.filter((item) =>
      String(item.produto || "").toLowerCase().includes(termo) ||
      String(item.sku || "").toLowerCase().includes(termo)
    );
    setFilteredProdutos(searchTerm.trim() === "" ? estoque : resultado);
  }, [searchTerm, estoque]);

  const handleProdutoSelecionado = (produto) => {
    setSku(produto.sku);
    setNomeProduto(produto.produto);
    setMarca(produto.marca);
    setLocal(produto.local);
    setQuantidade("");
    setIsModalOpen(false);
  };

  const handleRetirada = async () => {
    if (!sku || !nomeProduto || !marca || !quantidade || !retirante) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const retiradaNum = Number(quantidade);
    if (isNaN(retiradaNum) || retiradaNum <= 0) {
      toast.error("Quantidade inválida.");
      return;
    }

    try {
      const estoqueSnapshot = await get(ref(db, "Estoque"));
      if (!estoqueSnapshot.exists()) {
        toast.error("Estoque não encontrado.");
        return;
      }

      const estoqueData = estoqueSnapshot.val();
      const [produtoId, produtoInfo] = Object.entries(estoqueData).find(
        ([_, p]) => p.sku === sku
      ) || [];

      if (!produtoId) {
        toast.error("Produto não encontrado no estoque.");
        return;
      }

      const novaQuantidade = Number(produtoInfo.quantidade) - retiradaNum;

      await push(ref(db, "Retiradas"), {
        sku,
        produto: nomeProduto,
        marca,
        quantidade: retiradaNum,
        retirante,
        dataRetirada: dataSelecionada,
      });

      const produtoRef = ref(db, `Estoque/${produtoId}`);

      if (novaQuantidade <= 0) {
        await remove(produtoRef);
        toast.success("Produto removido do estoque.");
        setEstoque((prev) => prev.filter((p) => p.sku !== sku));
      } else {
        await update(produtoRef, { quantidade: novaQuantidade });
        toast.success("Retirada registrada e estoque atualizado.");
        setEstoque((prev) =>
          prev.map((p) =>
            p.sku === sku ? { ...p, quantidade: novaQuantidade } : p
          )
        );
      }

      // Reset
      setSku("");
      setNomeProduto("");
      setMarca("");
      setLocal("");
      setQuantidade("");
      setRetirante("");
      setDataSelecionada(new Date().toISOString().split("T")[0]);

    } catch (error) {
      toast.error("Erro ao registrar retirada.");
      console.error(error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "--";
    const [y, m, d] = date.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-indigo-700 to-gray-900 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Retirada de Produtos</h1>
        <div className="grid grid-cols-1 gap-4">
          <input className="p-3 border rounded-lg cursor-pointer" type="text" placeholder="SKU" value={sku} readOnly onClick={() => setIsModalOpen(true)} />
          <input className="p-3 border rounded-lg bg-gray-100" type="text" placeholder="Produto" value={nomeProduto} readOnly />
          <input className="p-3 border rounded-lg bg-gray-100" type="text" placeholder="Marca" value={marca} readOnly />
          <input className="p-3 border rounded-lg" type="number" min={1} placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
          <select className="p-3 border rounded-lg" value={retirante} onChange={(e) => setRetirante(e.target.value)}>
            <option value="">Escolha o Responsável</option>
            <option value="Karol">Karol</option>
            <option value="Guilherme">Guilherme</option>
            <option value="Rafael">Rafael</option>
            <option value="Rita">Rita</option>
          </select>
          <div>
            <label>Data da Retirada: </label>
            <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
          </div>
          <button onClick={handleRetirada} className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">Registrar Retirada</button>
          <button onClick={() => navigate(-1)} className="bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-semibold">Voltar</button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-5xl p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Produtos Disponíveis</h2>
            <input type="text" placeholder="Buscar por nome ou SKU" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mb-4 border rounded-lg" />
            <div className="overflow-x-auto">
              <button onClick={() => setIsModalOpen(false)} className="mb-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold">Fechar</button>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-sm md:text-base text-center">
                    <th className="p-2">Produto</th>
                    <th className="p-2">Marca</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Local</th>
                    <th className="p-2">Validade</th>
                    <th className="p-2">Selecionar</th>
                  </tr>
                </thead>
                <tbody className="text-center text-sm md:text-base">
                  {filteredProdutos.map((p) => {
                    const validadeProxima = p.validadeStatus <= 7;
                    return (
                      <tr key={p.id} className={`border-b hover:bg-gray-50 ${validadeProxima ? 'bg-red-100 border-red-500' : ''}`}>
                        <td className="p-2">{p.produto}</td>
                        <td className="p-2">{p.marca}</td>
                        <td className="p-2">{p.sku}</td>
                        <td className="p-2">{p.local}</td>
                        <td className="p-2">
                          {validadeProxima && (
                            <div className="flex items-center text-red-600 justify-center">
                              <FaExclamationCircle className="mr-1" />
                              Vencimento Próximo
                            </div>
                          )}
                          {formatDate(p.dataValidade)}
                        </td>
                        <td className="p-2">
                          <button onClick={() => handleProdutoSelecionado(p)} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold">Selecionar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
