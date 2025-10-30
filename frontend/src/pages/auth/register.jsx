import React, { useState } from "react";
import axios from "axios";
import "./Auth.css"; // le style qu’on fera juste après

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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
      const res = await axios.post("http://localhost:3000/user/register", {
        ...formData,
        role: "PATIENT", // ⚠️ forcer le rôle Patient
      });

      setMessage("✅ Compte patient créé avec succès !");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Créer un compte patient</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nom complet"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Adresse e-mail"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
        
          <input
            type="date"
            name="dateNaissance"
            value={formData.dateNaissance}
            onChange={handleChange}
          />
          <textarea
            name="antecedents"
            placeholder="Antécédents médicaux"
            value={formData.antecedents}
            onChange={handleChange}
          ></textarea>

          <button type="submit">S'inscrire</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
