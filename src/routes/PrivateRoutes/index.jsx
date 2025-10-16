// PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth } from "../../../firebase"; // ajuste caminho conforme seu projeto
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default function PrivateRoute({ allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const db = getDatabase();
          const userRef = ref(db, `usuarios/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserType(data.funcao || null);
          } else {
            setUserType(null);
          }
        } catch (error) {
          console.error("Erro ao buscar userType:", error);
          setUserType(null);
        }
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Carregando...</div>;

  if (!user) return <Navigate to="/" replace />; // redireciona para login

  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return (
      <div className="p-6 text-center text-red-600">
        Acesso negado: você não tem permissão para esta página.
      </div>
    );
  }

  // Passa userType como prop para o componente filho via context ou Outlet context
  return <Outlet context={{ userType }} />;
}
