import { useEffect, useState } from "react"
import { getDatabase, ref, onValue } from "firebase/database"
import { app } from "../../../firebase"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export default function PainelNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([])

  useEffect(() => {
    const db = getDatabase(app)
    const notificacoesRef = ref(db, "notificacoes")

    const unsubscribe = onValue(notificacoesRef, (snapshot) => {
      const data = snapshot.val() || {}
      const lista = Object.entries(data).map(([id, item]) => ({
        id,
        ...item,
      }))
      const ordenado = lista.sort((a, b) => new Date(b.data) - new Date(a.data))
      setNotificacoes(ordenado)
    })

    return () => unsubscribe()
  }, [])

  const formatData = (dataISO) => {
    const date = new Date(dataISO)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="text-lg">📢 Notificações de Retiradas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {notificacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma notificação registrada ainda.</p>
        ) : (
          notificacoes.map((n) => (
            <div
              key={n.id}
              className="border p-3 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50"
            >
              <div className="space-y-1">
                <p className="text-sm">
                  <strong>{n.usuario}</strong> retirou <strong>{n.quantidade}</strong> un. de{" "}
                  <strong>{n.item}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs mt-2 md:mt-0">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatData(n.data)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
