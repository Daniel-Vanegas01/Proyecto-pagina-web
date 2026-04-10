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

import PrivateRoute from "./componentes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 Rutas protegidas */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

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

        {/* 👁️ Ver cliente */}
        <Route
          path="/cliente/:id"
          element={
            <PrivateRoute>
              <VerCliente />
            </PrivateRoute>
          }
        />

        {/* ✏️ Editar cliente 🔥 */}
        <Route
          path="/editar-cliente/:id"
          element={
            <PrivateRoute>
              <EditarCliente />
            </PrivateRoute>
          }
        />

        {/* ➕ Crear negocio */}
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;