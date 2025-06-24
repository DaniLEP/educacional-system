import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { auth } from "../../../../firebase";

export default function Footer() {
  const [dateTime, setDateTime] = useState(dayjs().format("DD/MM/YYYY HH:mm"));
  const user = auth.currentUser;

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(dayjs().format("DD/MM/YYYY HH:mm"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray text-sm p-3 flex justify-between items-center">
      <p>👤 Usuário: {user?.email || "Desconhecido"}</p>
      <p>📅 {dateTime}</p>
      <div className="text-center text-sm text-gray-600">© 2024 Instituto Reciclar. Todos os direitos reservados.</div>

    </footer>
  );
}
