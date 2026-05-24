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

      {/* =========================
          MAIN
      ========================= */}
      <main className="home-main">

        {/* =========================
            CARD IZQUIERDA
        ========================= */}
        <div className="home-left">

          <div className="lex-card">

            <div className="lex-logo">
              ⚖️
            </div>

            <h1 className="lex-title">
              LexManager
            </h1>

            <p className="lex-slogan">
              Sistema inteligente para gestión jurídica
              y liquidaciones judiciales.
            </p>

            {/* MENU */}
            <div className="card-menu">

              <div
                className="card-menu-item"
                onClick={() => navigate("/clientes")}
              >
                Clientes
              </div>

              <div
                className="card-menu-item"
                onClick={() => navigate("/negocios")}
              >
                Negocios
              </div>

              <div
                className="card-menu-item"
                onClick={() => navigate("/liquidaciones")}
              >
                Liquidaciones
              </div>

              <div
                className="card-menu-item"
                onClick={() => navigate("/intereses")}
              >
                Intereses
              </div>

              <div
                className="card-menu-item logout-item"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </div>

            </div>

          </div>

        </div>

        {/* =========================
            TEXTO DERECHA
        ========================= */}
        <div className="home-right">

          <h1 className="welcome-text">
            Welcome Back
          </h1>

          <h2 className="user-name">
            {username}
          </h2>

          <p className="home-subtitle">
            Gestiona clientes, negocios, intereses y liquidaciones
            judiciales desde una sola plataforma moderna,
            rápida y profesional.
          </p>

        </div>

      </main>

    </div>
  );
}

export default Home;