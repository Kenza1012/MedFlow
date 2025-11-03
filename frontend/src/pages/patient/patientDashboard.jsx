import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPatientInfo,
  fetchRendezVous,
  fetchFactures,
  fetchMedecinsDisponibles,
  reserverRendezVous,
} from "../../services/patient";
import "./patient.css";

export default function PatientDashboard() {
  const [patientInfo, setPatientInfo] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [factures, setFactures] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [selectedMedecin, setSelectedMedecin] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [motif, setMotif] = useState("");
  const [activeTab, setActiveTab] = useState("informations");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /** 🔹 Récupère l'utilisateur connecté */
  const { user, userId } = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    const id = parsed?.id || parsed?.userId || null;
    return { user: parsed, userId: id };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  /** 🔹 Chargement initial des données */
  useEffect(() => {
    if (!userId) {
      console.error("❌ Aucun userId trouvé dans le localStorage !");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [info, med] = await Promise.all([
          fetchPatientInfo(userId),
          fetchMedecinsDisponibles(),
        ]);

        setPatientInfo(info);

        if (info?.id) {
          // ✅ Récupère les rendez-vous et factures du patient
          const [rdv, fact] = await Promise.all([
            fetchRendezVous(info.id),
            fetchFactures(info.id),
          ]);
          setRendezVous(rdv);
          setFactures(fact);
        } else {
          console.warn("⚠️ Aucun dossier patient trouvé pour cet utilisateur.");
        }

        setMedecins(med);
      } catch (error) {
        console.error("❌ Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  /** 🔹 Réservation d’un rendez-vous */
  const handleReserver = async (e) => {
  e.preventDefault();

  if (!selectedMedecin || !selectedDate || !motif) {
    alert("Veuillez sélectionner un médecin, une date et indiquer le motif.");
    return;
  }

  if (!userId) {
    alert("❌ Aucun utilisateur trouvé. Impossible de réserver.");
    return;
  }

  try {
    const data = {
      userId: Number(userId),                       // ✅ backend attend userId
      medecinId: Number(selectedMedecin),
      date: new Date(selectedDate).toISOString(),   // ✅ format ISO
      motif: motif.trim(),
    };

    const response = await reserverRendezVous(data);

    alert("✅ Rendez-vous réservé avec succès !");
    setSelectedMedecin("");
    setSelectedDate("");
    setMotif("");

    // Recharge les rendez-vous
    const updatedRdv = await fetchRendezVous(userId);
    setRendezVous(updatedRdv);
    setActiveTab("rendezvous");
  } catch (err) {
    console.error("❌ Erreur réservation:", err);
    alert(err.response?.data?.message || "Erreur lors de la réservation du rendez-vous.");
  }
};


  if (loading) {
    return <div className="loading">⏳ Chargement des données...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🧍‍♂️ Patient</h2>
        <button onClick={() => setActiveTab("informations")} className={activeTab === "informations" ? "active" : ""}>📘 Mes Informations</button>
        <button onClick={() => setActiveTab("rendezvous")} className={activeTab === "rendezvous" ? "active" : ""}>📅 Mes Rendez-vous</button>
        <button onClick={() => setActiveTab("reservation")} className={activeTab === "reservation" ? "active" : ""}>➕ Prendre un Rendez-vous</button>
        <button onClick={() => setActiveTab("factures")} className={activeTab === "factures" ? "active" : ""}>💳 Mes Factures</button>
        <button onClick={handleLogout} className="logout-btn">🚪 Déconnexion</button>
      </aside>

      {/* Contenu principal */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>📋 Tableau de bord Patient</h1>
          <div className="header-actions">
            <span className="patient-name">{user?.name || "Utilisateur"}</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/219/219970.png"
              alt="Patient Avatar"
              className="patient-avatar"
            />
          </div>
        </header>

        <div className="dashboard-content">
          {/* 🧾 Informations */}
          {activeTab === "informations" && (
            <section className="card">
              <h2>📘 Mes Informations</h2>
              {patientInfo ? (
                <>
                  <p><strong>Nom :</strong> {patientInfo.user?.name || "—"}</p>
                  <p><strong>Email :</strong> {patientInfo.user?.email || "—"}</p>
                  <p><strong>Date de naissance :</strong> {new Date(patientInfo.dateNaissance).toLocaleDateString()}</p>
                  <p><strong>Antécédents :</strong> {patientInfo.antecedents || "—"}</p>
                </>
              ) : (
                <p>⚠️ Aucun dossier patient trouvé.</p>
              )}
            </section>
          )}

          {/* 📅 Rendez-vous */}
          {activeTab === "rendezvous" && (
            <section className="card">
              <h2>📅 Mes Rendez-vous</h2>
              {rendezVous.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Motif</th>
                      <th>Médecin</th>
                      <th>Spécialité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendezVous.map((rdv) => (
                      <tr key={rdv.id}>
                        <td>{new Date(rdv.date).toLocaleString()}</td>
                        <td>{rdv.motif}</td>
                        <td>{rdv.medecin?.user?.name || "—"}</td>
                        <td>{rdv.medecin?.specialite || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun rendez-vous trouvé.</p>
              )}
            </section>
          )}

          {/* ➕ Réservation */}
          {activeTab === "reservation" && (
            <section className="card">
              <h2>➕ Prendre un Rendez-vous</h2>
              <form onSubmit={handleReserver} className="reservation-form">
                <label>Médecin :</label>
                <select value={selectedMedecin} onChange={(e) => setSelectedMedecin(e.target.value)}>
                  <option value="">-- Sélectionnez un médecin --</option>
                  {medecins.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.name || m.nom || "Médecin"} ({m.specialite})
                    </option>
                  ))}
                </select>

                <label>Date :</label>
                <input
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />

                <label>Motif :</label>
                <textarea
                  placeholder="Ex : Consultation de suivi, douleur, etc."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />

                <button type="submit">✅ Réserver</button>
              </form>
            </section>
          )}

          {/* 💳 Factures */}
          {activeTab === "factures" && (
            <section className="card">
              <h2>💳 Mes Factures</h2>
              {factures.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Montant</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factures.map((fact) => (
                      <tr key={fact.id}>
                        <td>{fact.id}</td>
                        <td>{fact.montant} DT</td>
                        <td>{new Date(fact.date).toLocaleDateString()}</td>
                        <td>{fact.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucune facture trouvée.</p>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
