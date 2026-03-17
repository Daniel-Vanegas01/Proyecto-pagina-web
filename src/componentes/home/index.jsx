import { useNavigate } from "react-router-dom";
import "./style.css";

function Home() {
  const navigate = useNavigate();

  // Obtener username desde localStorage
  const username = localStorage.getItem("username") || "Usuario";

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="menu-item" onClick={() => navigate("/clientes")}>
          Clientes
        </div>
        <div className="menu-item"></div>
        <div className="menu-item"></div>
        <div className="menu-item"></div>
        <div className="menu-item logout-item" onClick={handleLogout}>
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