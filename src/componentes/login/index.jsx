import { useState } from "react";
import { supabase } from "../../supabase/client";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return alert("Todos los campos son obligatorios.");
    }

    // Iniciar sesión con Supabase Auth
    const { data: session, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) return alert("Email o contraseña incorrectos.");

    // Traer username desde tabla users
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("username")
      .eq("email", email)
      .single();

    if (userError || !user) return alert("No se pudo obtener el nombre del usuario.");

    // Guardar username en localStorage
    localStorage.setItem("username", user.username);

    // Redirigir al Home
    navigate("/home");
  };

  return (
    <div className="login-container">
      <h1 className="login-title">LogIn</h1>
      <div className="login-box">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
        {/* Botón para ir a Register */}
        <button
          className="login-button-register"
          onClick={() => navigate("/register")}
        >
          No tienes cuenta? Regístrate
        </button>
      </div>
    </div>
  );
}

export default Login;