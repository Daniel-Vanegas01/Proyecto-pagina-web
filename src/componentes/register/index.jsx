import { useState } from "react";
import { supabase } from "../../supabase/client";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      return alert("Todos los campos son obligatorios.");
    }

    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return alert(authError.message);

    // Insertar username en tabla users
    const { error: tableError } = await supabase
      .from("users")
      .insert([{ email, username }]);

    if (tableError) return alert("Error al guardar el usuario en la tabla.");

    // Guardar username en localStorage
    localStorage.setItem("username", username);

    // Redirigir al Home
    navigate("/home");
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Register</h1>
      <div className="register-box">
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="register-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
        />
        <button className="register-button-main" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;