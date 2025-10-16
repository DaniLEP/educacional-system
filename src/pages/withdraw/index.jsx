import { useState, useEffect } from "react"
import { getDatabase, ref, onValue, update, push } from "firebase/database"
import { app } from "../../../firebase"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input/input"
import { Label } from "@/components/ui/label/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/hooks/use-toast"
import { Search, Package, AlertTriangle, ArrowLeft, Calendar, User, Hash, Building2 } from "lucide-react"
import { Toaster } from "sonner"
import { useNavigate } from "react-router-dom"

export default function Retirada() {
  const { toast } = useToast()
  const [sku, setSku] = useState("")
  const [nomeProduto, setNomeProduto] = useState("")
  const [marca, setMarca] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [retirante, setRetirante] = useState("")
  const [local, setLocal] = useState("")
  const [estoque, setEstoque] = useState([])
  const [filteredProdutos, setFilteredProdutos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split("T")[0])

  const calcularDiasParaValidade = (dataValidade) => {
    if (!dataValidade) return Number.POSITIVE_INFINITY
    const now = new Date()
    const validade = new Date(dataValidade)
    const diff = validade - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Buscar dados do estoque
  useEffect(() => {
    const db = getDatabase(app)
    const estoqueRef = ref(db, "Estoque")
    const unsubscribe = onValue(estoqueRef, (snapshot) => {
      const data = snapshot.val() || {}
      const lista = Object.entries(data).map(([id, produto]) => {
      const dias = calcularDiasParaValidade(produto.dataValidade)
        return {...produto, id, validadeStatus: dias}})
      setEstoque(lista)})
    return () => unsubscribe()}, [])

  // Alerta para produtos com validade próxima
  useEffect(() => {
    const alertaValidade = estoque.some((p) => p.validadeStatus <= 7)
    if (alertaValidade) {
      toast({title: "Atenção!", description: "Existem produtos próximos do vencimento.", variant: "destructive",})}}, [estoque])

  // Filtro da busca
  useEffect(() => {
    const termo = searchTerm.toLowerCase()
    const resultado = estoque.filter((item) => String(item.produto || "").toLowerCase().includes(termo) || String(item.sku || "").toLowerCase().includes(termo),)
    setFilteredProdutos(searchTerm.trim() === "" ? estoque : resultado)}, [searchTerm, estoque])

  // Selecionar produto da lista
  const handleProdutoSelecionado = (produto) => {
    setSku(produto.sku)
    setNomeProduto(produto.produto)
    setMarca(produto.marca)
    setLocal(produto.local)
    setQuantidade("")
    setIsModalOpen(false)
    toast({title: "Produto selecionado", description: `${produto.produto} foi selecionado para retirada.`,})
  }

  // Registrar retirada no banco e atualizar estoque
  const handleRetirada = async () => {
    if (!sku || !nomeProduto || !marca || !quantidade || !retirante) {
      toast({title: "Campos obrigatórios", description: "Por favor, preencha todos os campos.", variant: "destructive",})
      return
    }

    const retiradaNum = Number(quantidade)
    if (isNaN(retiradaNum) || retiradaNum <= 0) {
      toast({title: "Quantidade inválida", description: "Por favor, insira uma quantidade válida.", variant: "destructive",})
      return
    }

    const db = getDatabase(app)
    try {
      const produtoRef = ref(db, `Estoque/${sku}`)
      const produtoAtual = estoque.find((p) => p.sku === sku)
      const novaQuantidade = produtoAtual?.quantidade - retiradaNum

      if (novaQuantidade < 0) {
      toast({ title: "Estoque insuficiente", description: "A quantidade informada é maior que a disponível.", variant: "destructive",})
        return}
      await update(produtoRef, { quantidade: novaQuantidade })
      const retiradaRef = ref(db, "Retiradas")
      await push(retiradaRef, { sku, produto: nomeProduto, marca, quantidade: retiradaNum, retirante, local, data: dataSelecionada, timestamp: Date.now(),})
      toast({ title: "Retirada registrada!", description: `${retiradaNum} unidades de ${nomeProduto} foram retiradas por ${retirante}.`, })
      setSku("")
      setNomeProduto("")
      setMarca("")
      setLocal("")
      setQuantidade("")
      setRetirante("")
      setDataSelecionada(new Date().toISOString().split("T")[0])} 
    catch (error) {console.error(error), toast({title: "Erro", description: "Erro ao registrar retirada.", variant: "destructive"})}
  }

const formatDate = (date) => {
  if (!date) return "--";

  try {
    // Caso seja um objeto Date
    if (date instanceof Date) {
      return date.toLocaleDateString("pt-BR");
    }

    // Caso seja um número (timestamp)
    if (typeof date === "number") {
      const d = new Date(date);
      return d.toLocaleDateString("pt-BR");
    }

    // Caso seja string (como "2025-10-16" ou "2025-10-16T00:00:00Z")
    if (typeof date === "string") {
      const normalized = date.includes("T") ? date.split("T")[0] : date;
      const [y, m, d] = normalized.split("-");
      if (y && m && d) return `${d}/${m}/${y}`;
    }

    // fallback se algo vier inesperado
    return "--";
  } catch {
    return "--";
  }
};

  const getValidadeBadge = (dias) => {
    if (dias <= 2) {
      return (<Badge variant="destructive" className="flex items-center gap-1"> <AlertTriangle className="w-3 h-3" /> Vencido </Badge>)
    } 
    else if (dias <= 7) {
      return (<Badge variant="destructive" className="flex items-center gap-1"> <AlertTriangle className="w-3 h-3" /> Crítico </Badge>)
    } 
    else if (dias <= 30) {
      return (<Badge variant="secondary" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Atenção </Badge>)
    }
    return <Badge variant="outline">Normal</Badge>
  }

    const navigate = useNavigate();

return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Package className="w-6 h-6 text-primary" /> </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Retirada de Produtos</h1>
              <p className="text-sm text-gray-600">Gerencie a saída de produtos do estoque</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/Home')}> <ArrowLeft className="w-4 h-4" /> Voltar </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Informações da Retirada </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="flex items-center gap-2"><Hash className="w-4 h-4" /> SKU </Label>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Input id="sku" placeholder="Clique para selecionar produto" value={sku} readOnly className="cursor-pointer" />
                      </DialogTrigger>
<DialogContent className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden rounded-2xl">
                        <DialogHeader className="flex-shrink-0">
                          <DialogTitle className="flex items-center gap-2"><Search className="w-5 h-5" />Selecionar Produto do Estoque</DialogTitle>
                          <p className="text-sm text-gray-600">Encontre e selecione o produto que deseja retirar do estoque</p>
                        </DialogHeader>

                        <div className="flex-1 flex flex-col gap-4 min-h-0">
                          {/* Barra de Busca */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input placeholder="Buscar por nome do produto ou SKU..." value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-12"/>
                            </div>
                            {searchTerm && (<p className="text-sm text-gray-600 mt-2">{filteredProdutos.length} produto(s) encontrado(s)</p>)}
                          </div>

                          {/* Lista de Produtos */}
                          <div className="flex-1 overflow-y-auto min-h-0">
                            {filteredProdutos.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Package className="w-26 h-16 mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                                <p className="text-sm text-center">{searchTerm ? "Tente ajustar os termos de busca" : "Não há produtos disponíveis no estoque"}</p>
                              </div> ) : (
                              <div className="grid gap-3">
                                {filteredProdutos.map((produto) => (
                                  <Card key={produto.id} onClick={() => handleProdutoSelecionado(produto)}
                                    className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-semibold text-gray-900 truncate">{produto.produto}</h4>
                                              <p className="text-sm text-gray-600">{produto.marca}</p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0"> {getValidadeBadge(produto.validadeStatus)}</div>
                                          </div>

                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div>
                                              <span className="text-gray-500 block">SKU</span>
                                              <span className="font-mono font-medium">{produto.sku}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-500 block">Local</span>
                                              <span className="font-medium">{produto.local}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-500 block">Quantidade</span>
                                              <span className="font-medium">{produto.quantidade} un.</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-500 block">Validade</span>
                                              <span className="font-medium">{formatDate(produto.dataValidade)}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="ml-4 flex-shrink-0">
                                          <Button size="sm" className="whitespace-nowrap" onClick={(e) => {e.stopPropagation(), handleProdutoSelecionado(produto) }}>Selecionar</Button>
                                        </div>
                                      </div>

                                      {produto.validadeStatus <= 7 && (
                                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                                          <div className="flex items-center gap-2 text-red-700">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                              {produto.validadeStatus <= 2 ? "Produto vencido ou prestes a vencer!" : `Vence em ${produto.validadeStatus} dias`}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer do Modal */}
                          <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-gray-600">{filteredProdutos.length} de {estoque.length} produtos</div>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}> Cancelar</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="produto">Produto</Label>
                    <Input id="produto" value={nomeProduto} readOnly className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input id="marca" value={marca} readOnly className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="local" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Local
                    </Label>
                    <Input id="local" value={local} readOnly className="bg-gray-50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input id="quantidade"  type="number" min="1" placeholder="Digite a quantidade"value={quantidade} onChange={(e) => setQuantidade(e.target.value)}/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retirante" className="flex items-center gap-2"><User className="w-4 h-4" />Responsável</Label>
                    <Select value={retirante} onValueChange={setRetirante}>
                      <SelectTrigger><SelectValue placeholder="Selecione o responsável" /></SelectTrigger>
                      <SelectContent  className="w-[20px]">
                        <SelectItem value="Karol">Karoline Beretta</SelectItem>
                        <SelectItem value="Guilherme">Guilherme Mendes</SelectItem>
                        <SelectItem value="Rafael">Rafael Souza</SelectItem>
                        <SelectItem value="Rita">Rita Cássia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data" className="flex items-center gap-2"> <Calendar className="w-4 h-4" /> Data da Retirada</Label>
                  <Input id="data" type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
                </div>
                <Button onClick={handleRetirada} className="w-full" size="lg"> Registrar Retirada</Button>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Resumo da Retirada</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {nomeProduto ? (
                  <>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-900">{nomeProduto}</p>
                      <p className="text-sm text-blue-700">{marca}</p>
                      <p className="text-xs text-blue-600 font-mono">{sku}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Local:</span>
                        <span className="font-medium">{local}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantidade:</span>
                        <span className="font-medium">{quantidade || "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Responsável:</span>
                        <span className="font-medium">{retirante || "Não selecionado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data:</span>
                        <span className="font-medium">{formatDate(dataSelecionada)}</span>
                      </div>
                    </div>
                  </> ) : (<div className="text-center py-8 text-gray-500"><Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Selecione um produto para ver o resumo</p> </div> )}
              </CardContent>
            </Card>

            {/* Alertas */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-800"><AlertTriangle className="w-5 h-5" />Produtos em Alerta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {estoque .filter((p) => p.validadeStatus <= 7) .map((produto) => (
                      <div key={produto.id} className="flex items-center justify-between p-2 bg-white rounded border border-amber-200">
                        <div>
                          <p className="font-medium text-sm">{produto.produto}</p>
                          <p className="text-xs text-gray-600">{produto.sku}</p>
                        </div>
                        {getValidadeBadge(produto.validadeStatus)}
                      </div> ))}
                  {estoque.filter((p) => p.validadeStatus <= 7).length === 0 && (<p className="text-sm text-amber-700">Nenhum produto em alerta</p>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}