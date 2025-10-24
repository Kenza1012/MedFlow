import "./auth.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("✅ Login réussi :", res.data);

      // 🔹 Stocker le token JWT
      const token = res.data.access_token;
localStorage.setItem("token", token);              // clé "token" pour être compatible avec le dashboard
localStorage.setItem("user_role", res.data.user.role);
localStorage.setItem("userId", res.data.user.id);  // 🔹 IMPORTANT pour medecinId

      // 🔹 Redirection selon rôle
      const role = res.data.user.role;
      if (role === "MEDECIN") navigate("/medecin/dashboard");
      else if (role === "PATIENT") navigate("/patient/dashboard");
      else if (role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/");

    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setMessage(err.response?.data?.message || "Erreur lors de la connexion.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Connexion</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <div className="auth-footer">
        Pas encore de compte ? <a href="/register">Créer un compte</a>
      </div>
    </div>
  );
}
