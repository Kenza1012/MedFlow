import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css"; // 🔹 même style que Register

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // 🔹 Appel à ton backend NestJS
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      console.log("✅ Connexion réussie :", res.data);
      const { access_token, user } = res.data;

      // 🔹 Sauvegarde du token + infos utilisateur
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // 🔹 Redirection selon le rôle
      switch (user.role) {
        case "PATIENT":
          navigate("/patient/dashboard");
          break;
        case "MEDECIN":
          navigate("/medecin/dashboard");
          break;
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "RECEPTIONNISTE":
          navigate("/reception/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setMessage(
        err.response?.data?.message ||
          "❌ Email ou mot de passe incorrect."
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connexion</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Adresse e-mail"
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

        {message && <p className="message">{message}</p>}

        <div style={{ marginTop: "15px" }}>
          <span>Pas encore de compte ? </span>
          <a href="/register" style={{ color: "#2980b9", fontWeight: "600" }}>
            Créer un compte
          </a>
        </div>
      </div>
    </div>
  );
}
