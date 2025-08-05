import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import "./index.css";

import App from "./App.jsx";
import ErrorPage from "./components/ui/error";
import PrivateRoute from "./routes/PrivateRoutes/index"; // ajuste caminho

const Login = React.lazy(() => import("./pages/auth/index"));
const Home = React.lazy(() => import("./pages/home"));
const CadastroKalunga = React.lazy(() => import("./pages/register"));
const Estoque = React.lazy(() => import("./pages/stock"));
const Retirada = React.lazy(() => import("./pages/withdraw"));
const HistoricoRetiradas = React.lazy(() => import("./pages/withdraw/history_withdraw"));
const RegistroUser = React.lazy(() => import("./pages/auth/register_auth"));
const PainelNotificacoes = React.lazy(() => import("./components/notification"));
const GestaoUsuarios = React.lazy(() => import("./pages/gestão_users"));

const Loading = () => (
  <div className="p-6 text-center text-gray-500 text-sm">Carregando página...</div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Suspense fallback={<Loading />}><Login /></Suspense> },

      // Rotas protegidas
      {
        element: <PrivateRoute allowedRoles={[]} />, // aqui allowedRoles vazio = qualquer usuário logado
        children: [
          {path: "/Home", element: (<Suspense fallback={<Loading />}> <Home /></Suspense>),},
        ],
      },

      // Rotas que só Admin e Coordenador podem acessar
      {
        element: <PrivateRoute allowedRoles={["Admin", "Coordenador"]} />,
        children: [
          { path: "/register", element: (<Suspense fallback={<Loading />}><CadastroKalunga /></Suspense>),},
          { path: "/painel/notificacoes", element: (<Suspense fallback={<Loading />}><PainelNotificacoes /> </Suspense>),},

          { path: "/estoque", element: (<Suspense fallback={<Loading />}><Estoque /></Suspense>),},
          { path: "/retiradas", element: (<Suspense fallback={<Loading />}><Retirada /></Suspense>), },
          { path: "/historic-retiradas", element: (<Suspense fallback={<Loading />}><HistoricoRetiradas /></Suspense> ),},
        ],
      },

      // Rotas que só Admin pode acessar
      {
        element: <PrivateRoute allowedRoles={["Admin"]} />,
        children: [
          { path: "/register-user",element: (<Suspense fallback={<Loading />}><RegistroUser /></Suspense>),},
          { path: "/painel-users", element: (<Suspense fallback={<Loading />}><GestaoUsuarios /></Suspense>),},
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
