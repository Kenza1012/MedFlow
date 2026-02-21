// src/pages/patient/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./payment-status.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const token = localStorage.getItem("token");

      if (!sessionId || !token) {
        setError("Session ou token manquant");
        setVerifying(false);
        return;
      }

      try {
        console.log("🔍 Vérification paiement avec sessionId:", sessionId);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/paiement/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId }),
          }
        );

        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Paiement vérifié:", data);
        setVerifying(false);

        // Redirection après 3 secondes
        setTimeout(() => {
          navigate("/patient/dashboard");
        }, 3000);
      } catch (err) {
        console.error("❌ Erreur vérification paiement:", err);
        setError(err.message || "Erreur lors de la vérification du paiement");
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="payment-status-container success">
      <div className="payment-card">
        <div className="success-icon">✅</div>
        <h1>Paiement Réussi !</h1>

        {verifying ? (
          <>
            <p>Vérification de votre paiement en cours...</p>
            <div className="spinner"></div>
          </>
        ) : error ? (
          <>
            <p className="error-text">{error}</p>
            <button
              className="btn-primary"
              onClick={() => navigate("/patient/dashboard")}
            >
              Retour au tableau de bord
            </button>
          </>
        ) : (
          <>
            <p>✅ Votre facture a été marquée comme payée.</p>
            <p className="redirect-text">
              Redirection en cours... ou
              <button
                className="link-btn"
                onClick={() => navigate("/patient/dashboard")}
              >
                cliquez ici
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
