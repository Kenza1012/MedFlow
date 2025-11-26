// src/pages/patient/patientDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPatientInfo,
  fetchRendezVous,
  fetchFactures,
  fetchMedecinsDisponibles,
  reserverRendezVous,
  annulerRendezVous,
  modifierRendezVous,
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
  const [editRdvId, setEditRdvId] = useState(null);
  const [editData, setEditData] = useState({ date: "", motif: "" });
  const [activeTab, setActiveTab] = useState("informations");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();

  /** 🔹 Utilisateur connecté */
  const { user, userId } = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    const id = parsed?.id || parsed?.userId || null;
    console.log("👤 User récupéré:", { parsed, id });
    return { user: parsed, userId: id };
  }, []);

  /** 🔹 Déconnexion */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /** 🔹 Charger les données */
  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ userId manquant");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        console.log("📍 Chargement données pour userId:", userId);

        // 1️⃣ Récupérer les infos du patient par userId
        const info = await fetchPatientInfo(userId);
        console.log("✅ Info patient:", info);
        setPatientInfo(info);

        // 2️⃣ Récupérer les médecins disponibles
        const medecinsData = await fetchMedecinsDisponibles();
        console.log("✅ Médecins reçus:", medecinsData);
        setMedecins(medecinsData || []);

        // 3️⃣ Utiliser l'ID du patient pour les RDV et factures
        if (info?.id) {
          const [rdv, fact] = await Promise.all([
            fetchRendezVous(info.id),
            fetchFactures(info.id),
          ]);

          console.log("✅ Rendez-vous reçus:", rdv);
          console.log("✅ Factures reçues:", fact);

          setRendezVous(rdv || []);
          setFactures(fact || []);
        }
      } catch (err) {
        console.error("❌ Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, refreshKey]);

  /** 🔹 Réserver un rendez-vous */
  const handleReserver = async (e) => {
    e.preventDefault();

    if (!selectedMedecin || !selectedDate || !motif) {
      alert("❌ Veuillez remplir tous les champs.");
      return;
    }

    try {
      const data = {
        userId: Number(userId),
        medecinId: Number(selectedMedecin),
        date: new Date(selectedDate).toISOString(),
        motif: motif.trim(),
      };

      console.log("📤 Réservation RDV:", data);
      await reserverRendezVous(data);

      alert("✅ Rendez-vous réservé avec succès !");
      setSelectedMedecin("");
      setSelectedDate("");
      setMotif("");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("❌ Erreur réservation:", err);
      alert(err.response?.data?.message || "Erreur lors de la réservation.");
    }
  };

  /** ❌ Annuler rendez-vous */
  const handleCancelRendezVous = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?"))
      return;

    try {
      await annulerRendezVous(id);
      alert("✅ Rendez-vous annulé !");
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("❌ Erreur annulation:", error);
      alert("Erreur lors de l'annulation du rendez-vous.");
    }
  };

  /** ✏️ Modifier rendez-vous */
  const handleEditRendezVous = async (id) => {
    if (!editData.date || !editData.motif) {
      alert("❌ Veuillez remplir les champs de modification.");
      return;
    }

    try {
      await modifierRendezVous(id, {
        date: new Date(editData.date).toISOString(),
        motif: editData.motif,
      });
      alert("✅ Rendez-vous modifié !");
      setEditRdvId(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("❌ Erreur modification:", error);
      alert("Erreur lors de la modification.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* === SIDEBAR === */}
      <aside className="sidebar">
        <h2>🧍‍♂️ Patient</h2>
        <button
          onClick={() => setActiveTab("informations")}
          className={activeTab === "informations" ? "active" : ""}
        >
          👤 Informations
        </button>
        <button
          onClick={() => setActiveTab("rendezvous")}
          className={activeTab === "rendezvous" ? "active" : ""}
        >
          📅 Rendez-vous
        </button>
        <button
          onClick={() => setActiveTab("factures")}
          className={activeTab === "factures" ? "active" : ""}
        >
          💳 Factures
        </button>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Déconnexion
        </button>
      </aside>

      {/* === MAIN === */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>📋 Tableau de bord Patient</h1>
          <div className="header-actions">
            <span className="patient-name">{user?.name || "Utilisateur"}</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/219/219970.png"
              alt="avatar"
              className="patient-avatar"
            />
          </div>
        </header>

        <div className="dashboard-content">
          {/* === INFORMATIONS === */}
          {activeTab === "informations" && patientInfo && (
            <section className="card">
              <h2>👤 Mes Informations Personnelles</h2>

              {/*<div className="info-grid">*/}
                <div className="form-group row">
                  <label>Nom complet</label>
                  <input
                    type="text"
                    value={patientInfo.user?.name || ""}
                    disabled
                  />
                </div>

                <div className="form-group row">
                  <label>Email</label>
                  <input
                    type="email"
                    value={patientInfo.user?.email || ""}
                    disabled
                  />
                </div>

                <div className="form-group row">
                  <label>Date de naissance</label>
                  <input
                    type="date"
                    value={new Date(patientInfo.dateNaissance).toISOString().split("T")[0]}
                    disabled
                  />
                </div>

              
              {/*</div>*/}

              <div className="form-group full-width">
                <label>Antécédents médicaux</label>
                <textarea
                  value={patientInfo.antecedents || "Aucun"}
                  disabled
                  rows="5"
                />
              </div>
            </section>
          )}

          {/* === RENDEZ-VOUS === */}
          {activeTab === "rendezvous" && (
            <section className="card">
              <h2>📅 Mes Rendez-vous</h2>

              {/* Formulaire de réservation */}
              <form onSubmit={handleReserver} className="reservation-form">
                <label>Médecin :</label>
                <select
                  value={selectedMedecin}
                  onChange={(e) => setSelectedMedecin(e.target.value)}
                >
                  <option value="">-- Sélectionnez un médecin --</option>
                  {medecins.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.user?.name || "Médecin"} ({m.specialite || "Généraliste"})
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
                  placeholder="Ex: consultation, douleur..."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />

                <button type="submit">✅ Réserver</button>
              </form>

              {/* Liste des RDV */}
              <h3 className="section-title">Mes rendez-vous ({rendezVous.length})</h3>
              {rendezVous.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Motif</th>
                      <th>Médecin</th>
                      <th>Spécialité</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendezVous.map((rdv) => (
                      <React.Fragment key={rdv.id}>
                        <tr>
                          <td>{new Date(rdv.date).toLocaleString("fr-FR")}</td>
                          <td>{rdv.motif}</td>
                          <td>Dr. {rdv.medecin?.user?.name || "Inconnu"}</td>
                          <td>{rdv.medecin?.specialite || "?"}</td>
                          <td>
                            <span
                              className={`rdv-status ${rdv.status
                                ?.toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {rdv.status}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              className="btn-secondary"
                              disabled={rdv.status === "Annulé"}
                              onClick={() => {
                                setEditRdvId(rdv.id);
                                setEditData({
                                  date: rdv.date.slice(0, 16),
                                  motif: rdv.motif,
                                });
                              }}
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              className="btn-danger"
                              disabled={rdv.status === "Annulé"}
                              onClick={() => handleCancelRendezVous(rdv.id)}
                            >
                              ❌ Annuler
                            </button>
                          </td>
                        </tr>

                        {/* Ligne de modification inline */}
                        {editRdvId === rdv.id && (
                          <tr className="edit-row">
                            <td colSpan="6">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleEditRendezVous(rdv.id);
                                }}
                                className="edit-form"
                              >
                                <label>Nouvelle date :</label>
                                <input
                                  type="datetime-local"
                                  value={editData.date}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      date: e.target.value,
                                    })
                                  }
                                />

                                <label>Nouveau motif :</label>
                                <input
                                  type="text"
                                  value={editData.motif}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      motif: e.target.value,
                                    })
                                  }
                                />

                                <div className="edit-actions">
                                  <button
                                    type="submit"
                                    className="btn-primary"
                                  >
                                    💾 Enregistrer
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => setEditRdvId(null)}
                                  >
                                    ✖️ Annuler
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">Aucun rendez-vous programmé</p>
              )}
            </section>
          )}

          {/* === FACTURES === */}
          {activeTab === "factures" && (
            <section className="card">
              <h2>💳 Mes Factures ({factures.length})</h2>

              {factures.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Consultation</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factures.map((facture) => (
                      <tr key={facture.id}>
                        <td>
                          {new Date(facture.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td>
                          {facture.consultation?.diagnostic || "Consultation"}
                        </td>
                        <td className="amount">
                          {facture.montant} €
                        </td>
                        <td>
                          <span
                            className={`statut ${facture.statut
                              ?.toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {facture.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">Aucune facture</p>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}