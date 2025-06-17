import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import './index.css';
import App from './App.jsx';
import Login from './pages/auth/index';
import Home from './pages/home';
import ErrorPage from './components/ui/error';
import CadastroKalunga from './pages/register';
import Estoque from './pages/stock';
import Retirada from './pages/withdraw';
import HistoricoRetiradas from './pages/withdraw/history_withdraw';
import RegistroUser from './pages/auth/register_auth';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <Login /> },
      { path: '/Home', element: <Home /> },
      // Registers
      { path: '/register', element: <CadastroKalunga />},
      { path: '/estoque', element: <Estoque />},
      { path: '/retiradas', element: <Retirada />},
      { path: '/historic-retiradas', element: <HistoricoRetiradas />},
      { path: '/register-user', element: <RegistroUser />},



    ],
  },
]);
createRoot(document.getElementById('root')).render( <StrictMode> <RouterProvider router={router} /> </StrictMode>);
