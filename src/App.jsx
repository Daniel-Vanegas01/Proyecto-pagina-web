import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./componentes/login";
import Register from "./componentes/register";
import Home from "./componentes/home";
import Clientes from "./componentes/clientes";
import NuevoCliente from "./componentes/nuevocliente"; // <-- importamos el módulo
import PrivateRoute from "./componentes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;