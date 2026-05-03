import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./componentes/login";
import Register from "./componentes/register";
import Home from "./componentes/home";
import Clientes from "./componentes/clientes";
import NuevoCliente from "./componentes/nuevocliente";
import VerCliente from "./componentes/vercliente";
import EditarCliente from "./componentes/editarcliente";
import NuevoNegocio from "./componentes/nuevonegocio";
import VerNegocio from "./componentes/vernegocio";

// 🔥 NUEVOS MÓDULOS
import Modulonegocio from "./componentes/modulonegocio";
import Moduloliquidacion from "./componentes/moduloliquidacion";

// 🔥 LIQUIDACIÓN (pantalla principal)
import Liquidacion from "./componentes/liquidacion/Liquidacion";

import PrivateRoute from "./componentes/PrivateRoute";

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>

        {/* 🔓 Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 Rutas privadas */}

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* CLIENTES */}
        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <Clientes />
            </PrivateRoute>
          }
        />

        <Route
          path="/nuevo-cliente"
          element={
            <PrivateRoute>
              <NuevoCliente />
            </PrivateRoute>
          }
        />

        <Route
          path="/cliente/:id"
          element={
            <PrivateRoute>
              <VerCliente />
            </PrivateRoute>
          }
        />

        <Route
          path="/editar-cliente/:id"
          element={
            <PrivateRoute>
              <EditarCliente />
            </PrivateRoute>
          }
        />

        {/* NEGOCIOS */}
        <Route
          path="/negocios"
          element={
            <PrivateRoute>
              <Modulonegocio />
            </PrivateRoute>
          }
        />

        <Route
          path="/nuevo-negocio/:clienteId"
          element={
            <PrivateRoute>
              <NuevoNegocio />
            </PrivateRoute>
          }
        />

        <Route
          path="/negocio/:id"
          element={
            <PrivateRoute>
              <VerNegocio />
            </PrivateRoute>
          }
        />

        {/* LIQUIDACIONES */}
        <Route
          path="/liquidaciones"
          element={
            <PrivateRoute>
              <Moduloliquidacion />
            </PrivateRoute>
          }
        />

        <Route
          path="/liquidacion/:negocioId"
          element={
            <PrivateRoute>
              <Liquidacion />
            </PrivateRoute>
          }
        />

        {/* 🔥 fallback */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;