import { useState, useEffect } from "react";
import {
  getRendezVous,
  getConsultations,
  addConsultation,
  downloadOrdonnance,
} from "../../services/medecin";
import "../../styles/global.css";
import { useNavigate } from "react-router-dom";

export default function MedecinDashboard() {
  const [rendezVous, setRendezVous] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [diagnostic, setDiagnostic] = useState("");
  const [prescription, setPrescription] = useState("");
  const [posting, setPosting] = useState(false);
  const [activeTab, setActiveTab] = useState("rendezvous");

  const [avatar, setAvatar] = useState(
    localStorage.getItem("medecinAvatar") ||
      "https://png.pngtree.com/png-clipart/20230918/ourmid/pngtree-photo-men-doctor-physician-chest-smiling-png-image_10132895.png"
  );

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("medecinAvatar", avatar);
  }, [avatar]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rdvs = await getRendezVous();
        const cons = await getConsultations();
        setRendezVous(rdvs || []);
        setConsultations(cons || []);
      } catch (err) {
        console.error("Erreur lors du fetch des données :", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const [medecin, setMedecin] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setMedecin(JSON.parse(userData));
      } catch (err) {
        console.error("Erreur parsing user:", err);
      }
    }
  }, []);

  const handleDownload = async (consultationId) => {
    try {
      await downloadOrdonnance(consultationId);
    } catch (err) {
      console.error("Erreur téléchargement ordonnance :", err);
    }
  };

  const handleAddConsultation = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !diagnostic)
      return alert("Patient et diagnostic requis !");
    setPosting(true);
    try {
      const newConsult = await addConsultation({
        patientId: Number(selectedPatientId),
        diagnostic,
        prescription,
      });
      alert("Consultation ajoutée avec succès !");
      setConsultations([...consultations, newConsult]);
      setSelectedPatientId("");
      setDiagnostic("");
      setPrescription("");
    } catch (err) {
      console.error("Erreur ajout consultation :", err);
      alert("Erreur lors de l'ajout de la consultation");
    }
    setPosting(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetAvatar = () => {
    localStorage.removeItem("medecinAvatar");
    setAvatar(
      "https://png.pngtree.com/png-clipart/20230918/ourmid/pngtree-photo-men-doctor-physician-chest-smiling-png-image_10132895.png"
    );
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar gradient-medecin">
        <h2>👨‍⚕️ Médecin</h2>
        <button
          className={activeTab === "rendezvous" ? "active" : ""}
          onClick={() => setActiveTab("rendezvous")}
        >
          📅 Rendez-vous
        </button>
        <button
          className={activeTab === "consultations" ? "active" : ""}
          onClick={() => setActiveTab("consultations")}
        >
          📋 Consultations
        </button>
        <button
          className={activeTab === "ajouter" ? "active" : ""}
          onClick={() => setActiveTab("ajouter")}
        >
          📝 Ajouter Consultation
        </button>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Déconnexion
        </button>
      </aside>

      {/* Contenu principal */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>🩺 Tableau de bord Médecin</h1>
          </div>

          <div className="header-actions">
            <span className="doctor-name">
              {medecin ? `Dr. ${medecin.name || medecin.username}` : "Chargement..."}
            </span>

            {/* Avatar avec upload */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <img
                src={avatar}
                alt="Médecin"
                className="doctor-avatar"
                onClick={() => document.getElementById("avatarInput").click()}
                title="Changer la photo"
                style={{ cursor: 'pointer' }}
              />
              <button 
                onClick={resetAvatar} 
                style={{
                  position: 'absolute',
                  bottom: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Réinitialiser"
              >
                🗑️
              </button>
            </div>
          </div>
        </header>

        {/* Sections dynamiques */}
        <div className="dashboard-content">
          {activeTab === "rendezvous" && (
            <section className="card">
              <h2>📅 Rendez-vous à venir</h2>
              {rendezVous.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>Aucun rendez-vous</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {rendezVous.map((rdv) => (
                    <div
                      key={rdv.id}
                      style={{
                        padding: '16px',
                        background: 'white',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'}
                    >
                      <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '5px' }}>
                        👤 {rdv.patient?.user?.name || "Inconnu"}
                      </p>
                      <p style={{ color: 'var(--text-light)' }}>
                        📅 {new Date(rdv.date).toLocaleString()}
                      </p>
                      {rdv.motif && (
                        <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>
                          📝 {rdv.motif}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "ajouter" && (
            <section className="card">
              <h2>📝 Ajouter une consultation</h2>
              <form
                onSubmit={handleAddConsultation}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}
              >
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                  >
                    <option value="">-- Sélectionner un patient --</option>
                    {rendezVous.map((rdv) => (
                      <option key={rdv.id} value={rdv.patient.id}>
                        {rdv.patient.user.name} ({new Date(rdv.date).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Diagnostic</label>
                  <input
                    type="text"
                    value={diagnostic}
                    onChange={(e) => setDiagnostic(e.target.value)}
                    required
                    placeholder="Ex: Infection virale"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Prescription</label>
                  <input
                    type="text"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Ex: Paracétamol 500mg"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <button
                    type="submit"
                    disabled={posting}
                    className={posting ? "btn-secondary" : "btn-primary"}
                    style={posting ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {posting ? "Ajout en cours..." : "Ajouter Consultation"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === "consultations" && (
            <section className="card">
              <h2>📋 Liste des consultations</h2>
              {consultations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>Aucune consultation enregistrée</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Diagnostic</th>
                        <th style={{ textAlign: 'center' }}>Ordonnance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultations.map((c) => (
                        <tr key={c.id}>
                          <td>{c.patient?.user?.name || "Inconnu"}</td>
                          <td>{c.diagnostic}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDownload(c.id)}
                              className="btn-secondary"
                            >
                              📄 Télécharger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}