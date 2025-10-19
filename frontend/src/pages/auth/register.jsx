import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import React, { useState } from "react";
import "./auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT",
    specialite: "",
    dateNaissance: "",
    antecedents: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/user/register", formData);
      console.log("✅ Utilisateur créé :", response.data);
      setMessage("Inscription réussie !");
      setTimeout(() => navigate("/"), 1500); // redirige vers login
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      setMessage(
        error.response?.data?.message || "Erreur lors de l'inscription."
      );
    }
  };

  return (
    <div className="auth-container">
    <div style={styles.container}>
      <h2 style={styles.title}>Créer un compte</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Nom complet"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        {/* Sélection du rôle */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="PATIENT">Patient</option>
          <option value="MEDECIN">Médecin</option>
          <option value="RECEPTIONNISTE">Réceptionniste</option>
          <option value="ADMIN">Admin</option>
        </select>

        {/* Champs spécifiques selon rôle */}
        {formData.role === "MEDECIN" && (
          <input
            type="text"
            name="specialite"
            placeholder="Spécialité du médecin"
            value={formData.specialite}
            onChange={handleChange}
            required
            style={styles.input}
          />
        )}

        {formData.role === "PATIENT" && (
          <>
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <textarea
              name="antecedents"
              placeholder="Antécédents médicaux"
              value={formData.antecedents}
              onChange={handleChange}
              style={styles.textarea}
            />
          </>
        )}

        <button type="submit" style={styles.button}>
          S'inscrire
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <p>
        Déjà un compte ?{" "}
        <span
          onClick={() => navigate("/")}
          style={{ color: "#007BFF", cursor: "pointer" }}
        >
          Se connecter
        </span>
      </p>
    </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "60px auto",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    resize: "none",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    background: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
    fontWeight: "bold",
  },
};
