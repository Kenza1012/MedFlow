// src/pages/patient/PatientDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPatientInfo, fetchRendezVous, fetchFactures } from "../../services/patient";
import "./patient.css";

export default function PatientDashboard() {
  const [patientInfo, setPatientInfo] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [factures, setFactures] = useState([]);
  const [activeTab, setActiveTab] = useState("informations");
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔹 Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [info, rdv, fact] = await Promise.all([
          fetchPatientInfo(user.id),
          fetchRendezVous(user.id),
          fetchFactures(user.id),
        ]);
        
        setPatientInfo(info);
        setRendezVous(rdv);
        setFactures(fact);
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);



  return (
    <div className="dashboard-container">
      {/* --- Sidebar --- */}
      <aside className="sidebar">
        <h2>🧍‍♂️ Patient</h2>
        <button 
          onClick={() => setActiveTab("informations")} 
          className={activeTab === "informations" ? "active" : ""}
        >
          📘 Mes Informations
        </button>
        <button 
          onClick={() => setActiveTab("rendezvous")} 
          className={activeTab === "rendezvous" ? "active" : ""}
        >
          📅 Mes Rendez-vous
        </button>
        <button 
          onClick={() => setActiveTab("factures")} 
          className={activeTab === "factures" ? "active" : ""}
        >
          💳 Mes Factures
        </button>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Déconnexion
        </button>
      </aside>

      {/* --- Main Content --- */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>📋 Tableau de bord Patient</h1>
          </div>
          <div className="header-actions">
            <button className="notif-btn">🔔</button>
            <span className="patient-name">{user?.name}</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/219/219970.png"
              alt="Patient Avatar"
              className="patient-avatar"
            />
          </div>
        </header>

        <div className="dashboard-content">
          {/* Section Informations */}
          {activeTab === "informations" && (
            <section className="card">
              <h2>👤 Mes Informations</h2>
              {patientInfo ? (
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Nom :</strong> 
                    <span>{patientInfo.user?.name || "-"}</span>
                  </div>
                  <div className="info-item">
                    <strong>Email :</strong> 
                    <span>{patientInfo.user?.email || "-"}</span>
                  </div>
                  <div className="info-item">
                    <strong>Date de naissance :</strong> 
                    <span>
                      {patientInfo.dateNaissance 
                        ? new Date(patientInfo.dateNaissance).toLocaleDateString('fr-FR')
                        : "-"
                      }
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Antécédents :</strong> 
                    <span>{patientInfo.antecedents || "Aucun renseigné"}</span>
                  </div>
                </div>
              ) : (
                <p>Aucune information disponible</p>
              )}
            </section>
          )}

          {/* Section Rendez-vous */}
          {activeTab === "rendezvous" && (
            <section className="card">
              <h2>📅 Mes Rendez-vous</h2>
              {rendezVous.length === 0 ? (
                <p>Aucun rendez-vous prévu.</p>
              ) : (
                <div className="rendezvous-list">
                  {rendezVous.map((rdv) => (
                    <div key={rdv.id} className="rendezvous-card">
                      <div className="rdv-date">
                        {new Date(rdv.date).toLocaleString('fr-FR')}
                      </div>
                      <div className="rdv-motif">{rdv.motif}</div>
                      <div className="rdv-medecin">
                        Dr. {rdv.medecin?.user?.name}
                      </div>
                      <div className={`rdv-status ${rdv.status?.toLowerCase()}`}>
                        {rdv.status || "En attente"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Section Factures */}
          {activeTab === "factures" && (
            <section className="card">
              <h2>💳 Mes Factures</h2>
              {factures.length === 0 ? (
                <p>Aucune facture disponible.</p>
              ) : (
                <table className="factures-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Montant (€)</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factures.map((facture) => (
                      <tr key={facture.id}>
                        <td>#{facture.id}</td>
                        <td>{facture.montant} €</td>
                        <td>{new Date(facture.date).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <span className={`statut ${facture.statut?.toLowerCase()}`}>
                            {facture.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}