import { useState, useEffect } from "react";
import {
  getRendezVous,
  getConsultations,
  addConsultation,
  downloadOrdonnance,
} from "../../services/medecin";
import { useNavigate } from "react-router-dom";
import "./MedecinDashboard.css";

export default function MedecinDashboard() {
  const [rendezVous, setRendezVous] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [diagnostic, setDiagnostic] = useState("");
  const [prescription, setPrescription] = useState("");
  const [posting, setPosting] = useState(false);
  const [activeTab, setActiveTab] = useState("rendezvous");

  // ✅ Avatar sauvegardé dans le localStorage
  const [avatar, setAvatar] = useState(
    localStorage.getItem("medecinAvatar") ||
      "https://png.pngtree.com/png-clipart/20230918/ourmid/pngtree-photo-men-doctor-physician-chest-smiling-png-image_10132895.png"
  );

  const navigate = useNavigate();

  // ✅ Sauvegarde de l’image dans localStorage
  useEffect(() => {
    localStorage.setItem("medecinAvatar", avatar);
  }, [avatar]);

  // ✅ Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // ✅ Charger les données
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

  // ✅ Télécharger une ordonnance
  const handleDownload = async (consultationId) => {
    try {
      await downloadOrdonnance(consultationId);
    } catch (err) {
      console.error("Erreur téléchargement ordonnance :", err);
    }
  };

  // ✅ Ajouter une consultation
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

  // ✅ Changer l’image du médecin
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Réinitialiser la photo
  const resetAvatar = () => {
    localStorage.removeItem("medecinAvatar");
    setAvatar(
      "https://png.pngtree.com/png-clipart/20230918/ourmid/pngtree-photo-men-doctor-physician-chest-smiling-png-image_10132895.png"
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
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
        {/* ✅ Header amélioré */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>🩺 Tableau de bord Médecin</h1>
          </div>

          <div className="header-actions">
            <button className="notif-btn">🔔</button>
            <span className="doctor-name">Dr. Ahmed</span>

            {/* ✅ Upload d’image persistante */}
            <div className="avatar-upload">
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
              />
              <button onClick={resetAvatar} className="reset-btn" title="Réinitialiser">
                🗑️
              </button>
            </div>
          </div>
        </header>

        {/* ✅ Sections dynamiques */}
        <div className="dashboard-content">
          {activeTab === "rendezvous" && (
            <section className="card">
              <h2>📅 Rendez-vous à venir</h2>
              {rendezVous.length === 0 ? (
                <p className="text-gray-500">Aucun rendez-vous.</p>
              ) : (
                <div className="rendezvous-list">
                  {rendezVous.map((rdv) => (
                    <div
                      key={rdv.id}
                      className="rendezvous-card p-4 mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition"
                    >
                      <p className="text-gray-700 font-semibold">
                        👤 {rdv.patient?.user?.name || "Inconnu"}
                      </p>
                      <p className="text-gray-500">
                        📅 {new Date(rdv.date).toLocaleString()}
                      </p>
                      {rdv.motif && <p className="text-gray-400">📝 {rdv.motif}</p>}
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
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div>
                  <label>Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                  >
                    <option value="">-- Sélectionner un patient --</option>
                    {rendezVous.map((rdv) => (
                      <option key={rdv.id} value={rdv.patient.id}>
                        {rdv.patient.user.name} (
                        {new Date(rdv.date).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Diagnostic</label>
                  <input
                    type="text"
                    value={diagnostic}
                    onChange={(e) => setDiagnostic(e.target.value)}
                    required
                    placeholder="Ex: Infection virale"
                  />
                </div>

                <div>
                  <label>Prescription</label>
                  <input
                    type="text"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Ex: Paracétamol 500mg"
                  />
                </div>

                <div className="md:col-span-3 flex justify-center mt-4">
                  <button
                    type="submit"
                    disabled={posting}
                    className={posting ? "btn-disabled" : "btn-primary"}
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
                <p className="text-gray-500">Aucune consultation enregistrée.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table
                    className="consultations-table"
                    style={{ width: "100%", borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        <th style={{ padding: "12px" }}>Patient</th>
                        <th style={{ padding: "12px" }}>Diagnostic</th>
                        <th style={{ padding: "12px", textAlign: "center" }}>
                          Ordonnance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultations.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "12px" }}>
                            {c.patient?.user?.name || "Inconnu"}
                          </td>
                          <td style={{ padding: "12px" }}>{c.diagnostic}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
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
