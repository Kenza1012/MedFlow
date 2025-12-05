
import "../../styles/global.css";
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

  const { user, userId, token } = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    const id = parsed?.id || parsed?.userId || null;
    const authToken = localStorage.getItem("token") || "";
    console.log("👤 User récupéré:", { parsed, id, token: authToken });
    return { user: parsed, userId: id, token: authToken };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

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

        const info = await fetchPatientInfo(userId);
        console.log("✅ Info patient:", info);
        setPatientInfo(info);

        const medecinsData = await fetchMedecinsDisponibles();
        console.log("✅ Médecins reçus:", medecinsData);
        setMedecins(medecinsData || []);

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

  const handlePayNow = async (factureId) => {
    if (!token) {
      alert("❌ Vous n'êtes pas authentifié");
      return;
    }

    try {
      console.log("💳 Initiation paiement pour facture:", factureId);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/paiement/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ factureId }),
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const { sessionId, url } = await res.json();
      console.log("✅ Session créée:", sessionId);
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (err) {
      console.error("❌ Erreur paiement:", err);
      alert(err.message || "Erreur lors du paiement");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar gradient-patient">
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

      {/* Main */}
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
          {/* INFORMATIONS */}
          {activeTab === "informations" && patientInfo && (
            <section className="card">
              <h2>👤 Mes Informations Personnelles</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ fontWeight: 600 }}>Nom complet</label>
                <input
                  type="text"
                  value={patientInfo.user?.name || ""}
                  disabled
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ fontWeight: 600 }}>Email</label>
                <input
                  type="email"
                  value={patientInfo.user?.email || ""}
                  disabled
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ fontWeight: 600 }}>Date de naissance</label>
                <input
                  type="date"
                  value={new Date(patientInfo.dateNaissance).toISOString().split("T")[0]}
                  disabled
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Antécédents médicaux</label>
                <textarea
                  value={patientInfo.antecedents || "Aucun"}
                  disabled
                  rows="5"
                />
              </div>
            </section>
          )}

          {/* RENDEZ-VOUS */}
          {activeTab === "rendezvous" && (
            <section className="card">
              <h2>📅 Mes Rendez-vous</h2>

              {/* Formulaire de réservation */}
              <form 
                onSubmit={handleReserver} 
                style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '30px'
                }}
              >
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Médecin :</label>
                <select
                  value={selectedMedecin}
                  onChange={(e) => setSelectedMedecin(e.target.value)}
                  style={{ marginBottom: '16px' }}
                >
                  <option value="">-- Sélectionnez un médecin --</option>
                  {medecins.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.user?.name || "Médecin"} ({m.specialite || "Généraliste"})
                    </option>
                  ))}
                </select>

                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Date :</label>
                <input
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />

                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Motif :</label>
                <textarea
                  placeholder="Ex: consultation, douleur..."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  style={{ marginBottom: '16px' }}
                />

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  ✅ Réserver
                </button>
              </form>

              {/* Liste des RDV */}
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '30px 0 20px' }}>
                Mes rendez-vous ({rendezVous.length})
              </h3>
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
                            <span className={`badge ${rdv.status?.toLowerCase() === 'confirmé' ? 'green' : rdv.status?.toLowerCase() === 'annulé' ? 'red' : ''}`}>
                              {rdv.status}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: '8px' }}>
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
                          <tr style={{ background: '#f9fafb' }}>
                            <td colSpan="6">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleEditRendezVous(rdv.id);
                                }}
                                style={{
                                  padding: '20px',
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '15px'
                                }}
                              >
                                <div>
                                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nouvelle date :</label>
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
                                </div>

                                <div>
                                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nouveau motif :</label>
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
                                </div>

                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                  <button type="submit" className="btn-primary">
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
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>Aucun rendez-vous programmé</p>
                </div>
              )}
            </section>
          )}

          {/* FACTURES */}
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
                      <th>Action</th>
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
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {facture.montant} €
                        </td>
                        <td>
                          <span className={`badge ${facture.statut?.toLowerCase() === 'payée' ? 'green' : 'red'}`}>
                            {facture.statut}
                          </span>
                        </td>
                        <td>
                          {facture.statut && 
                           facture.statut.toLowerCase() !== "payée" && (
                            <button
                              className="btn-primary"
                              onClick={() => handlePayNow(facture.id)}
                            >
                              💳 Payer maintenant
                            </button>
                          )}
                          {facture.statut === "Payée" && (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Payée</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💳</div>
                  <p>Aucune facture</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}