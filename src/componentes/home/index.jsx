import { useNavigate } from "react-router-dom";
import "./style.css";

function Home() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Usuario";

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="home-container">
      <nav className="home-nav">

        {/* Clientes */}
        <div 
          className="menu-item" 
          onClick={() => navigate("/clientes")}
        >
          Clientes
        </div>

        {/* Negocios */}
        <div 
          className="menu-item" 
          onClick={() => navigate("/negocios")}
        >
          Negocios
        </div>

        {/* Liquidaciones */}
        <div 
          className="menu-item" 
          onClick={() => navigate("/liquidaciones")}
        >
          Liquidaciones
        </div>

        {/* 🔥 Intereses (NUEVO MÓDULO) */}
        <div 
          className="menu-item" 
          onClick={() => navigate("/intereses")}
        >
          Intereses
        </div>

        {/* Cerrar sesión */}
        <div 
          className="menu-item logout-item" 
          onClick={handleLogout}
        >
          Cerrar Sesión
        </div>

      </nav>

      <main className="home-main">
        <h1 className="welcome-text">Welcome Back</h1>
        <h2 className="user-name">{username}</h2>
      </main>
    </div>
  );
}

export default Home;