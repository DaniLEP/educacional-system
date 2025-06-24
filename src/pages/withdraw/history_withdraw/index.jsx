import { useEffect, useState } from "react"
import { Search, Calendar, User, Package, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label/label"
import { useNavigate } from "react-router-dom"
import { getDatabase, ref, get } from "firebase/database"

export default function HistoricoRetiradas() {
  const [retiradas, setRetiradas] = useState([])
  const [search, setSearch] = useState("")
  const [responsavel, setResponsavel] = useState("all")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRetiradas = async () => {
      try {
        const db = getDatabase()
        const retiradasRef = ref(db, "Retiradas")
        const snapshot = await get(retiradasRef)
        if (snapshot.exists()) {const data = snapshot.val()
          const arrayRetiradas = Object.entries(data).map(([id, values]) => ({id, ...values})) 
          setRetiradas(arrayRetiradas)} 
        else {setRetiradas([])}} 
        catch (error) {console.error("Erro ao buscar retiradas:", error)} 
        finally {setLoading(false) }
    } 
    fetchRetiradas()}, [])

  const filtradas = retiradas.filter((r) => {
    const matchProduto = r.produto.toLowerCase().includes(search.toLowerCase()) || r.sku.toLowerCase().includes(search.toLowerCase())
    const matchResponsavel = responsavel !== "all" ? r.retirante === responsavel : true
    const matchData =  dataInicio && dataFim ? new Date(r.dataRetirada) >= new Date(dataInicio) && new Date(r.dataRetirada) <= new Date(dataFim) : true
    return matchProduto && matchResponsavel && matchData
  })

  function formatDate(dateString) {
    if (!dateString) return "-"
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                <span className="ml-2 text-slate-600">Carregando histórico...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/Home")} className="bg-white"> <ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Histórico de Retiradas</h1>
            <p className="text-slate-600 mt-1">Visualize e filtre todas as retiradas registradas</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Search className="h-5 w-5" /> Filtros de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="search">Buscar produto ou SKU</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="search" type="text" placeholder="Digite o produto ou SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={responsavel} onValueChange={setResponsavel}>
                  <SelectTrigger>
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os responsáveis</SelectItem>
                    <SelectItem value="Karol">Karol</SelectItem>
                    <SelectItem value="Luciano">Luciano</SelectItem>
                    <SelectItem value="Rafael">Rafael</SelectItem>
                    <SelectItem value="Rita">Rita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Resultados</CardTitle>
              <div className="text-sm text-slate-600">{filtradas.length} {filtradas.length === 1 ? "retirada encontrada" : "retiradas encontradas"}</div>
            </div>
          </CardHeader>
          <CardContent>
            {filtradas.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma retirada encontrada</h3>
                <p className="text-slate-600">Tente ajustar os filtros para encontrar o que procura.</p>
              </div>) : (<div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtradas.map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{r.produto}</TableCell>
                        <TableCell className="font-mono text-sm">{r.sku}</TableCell>
                        <TableCell>{r.marca}</TableCell>
                        <TableCell className="text-center"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {r.quantidade}</span> </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">{r.retirante?.charAt(0)} </div> {r.retirante}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(r.dataRetirada)}</TableCell>
                      </TableRow> ))}
                  </TableBody>
                </Table>
              </div> )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
