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

// =========================
// MÓDULOS PRINCIPALES
// =========================
import Modulonegocio from "./componentes/modulonegocio";
import Moduloliquidacion from "./componentes/moduloliquidacion";

// =========================
// FACTURAS
// =========================
import CrearFactura from "./componentes/crearfactura/CrearFactura";

// =========================
// LIQUIDACIONES
// =========================
import CrearLiquidacion from "./componentes/crearliquidacion/CrearLiquidacion";
import GenerarLiquidacion from "./componentes/generarliquidacion/GenerarLiquidacion";

// 🔥 NUEVO MÓDULO DOCUMENTO FINAL
import GenerarDocumentoLiquidacion from "./componentes/documentoliquidacion/GenerarDocumentoLiquidacion";

// =========================
// OTROS
// =========================
import Intereses from "./componentes/intereses";

import PrivateRoute from "./componentes/PrivateRoute";

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>

        {/* 🔓 PÚBLICAS */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 HOME */}
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

        {/* FACTURAS */}
        <Route
          path="/facturas/:negocioId"
          element={
            <PrivateRoute>
              <CrearFactura />
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
          path="/crear-liquidacion/:negocioId"
          element={
            <PrivateRoute>
              <CrearLiquidacion />
            </PrivateRoute>
          }
        />

        <Route
          path="/generar-liquidacion/:negocioId"
          element={
            <PrivateRoute>
              <GenerarLiquidacion />
            </PrivateRoute>
          }
        />

        {/* 🔥 DOCUMENTO FINAL (NUEVO) */}
        <Route
          path="/documento-liquidacion/:negocioId"
          element={
            <PrivateRoute>
              <GenerarDocumentoLiquidacion />
            </PrivateRoute>
          }
        />

        {/* INTERESES */}
        <Route
          path="/intereses"
          element={
            <PrivateRoute>
              <Intereses />
            </PrivateRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;