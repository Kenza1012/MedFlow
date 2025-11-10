import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { receptionnisteService } from "../../services/receptionniste";
import "./ReceptionDashboard.css";

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  
  const [data, setData] = useState({
    rendezVous: [],
    factures: [],
    patients: [],
    medecins: [],
    consultations: []
  });

  const [formData, setFormData] = useState({
    factureMontant: "",
    facturePatientId: "",
    factureConsultationId: ""
  });

  const [patientFormData, setPatientFormData] = useState({
    name: "",
    email: "",
    password: "",
    dateNaissance: "",
    antecedents: ""
  });

  // Informations du réceptionniste
  const receptionnisteInfo = {
    name: localStorage.getItem("user_name") || "Réceptionniste",
    email: localStorage.getItem("user_email") || "reception@clinique.com"
  };

  // Charger toutes les données
  const loadData = async () => {
    setLoading(true);
    try {
      const [rdv, factures, patients, medecins, consultations] = await Promise.all([
        receptionnisteService.getAllRendezVous(),
        receptionnisteService.getAllFactures(),
        receptionnisteService.getAllPatients(),
        receptionnisteService.getAllMedecins(),
        receptionnisteService.getAllConsultations()
      ]);
      
      setData({
        rendezVous: Array.isArray(rdv) ? rdv : [],
        factures: Array.isArray(factures) ? factures : [],
        patients: Array.isArray(patients) ? patients : [],
        medecins: Array.isArray(medecins) ? medecins : [],
        consultations: Array.isArray(consultations) ? consultations : []
      });
    } catch (error) {
      console.error("Erreur chargement données:", error);
      setData({
        rendezVous: [],
        factures: [],
        patients: [],
        medecins: [],
        consultations: []
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    navigate("/");
  };

  const handleCancelRendezVous = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      try {
        await receptionnisteService.cancelRendezVous(id);
        alert("Rendez-vous annulé avec succès !");
        await loadData();
      } catch (error) {
        alert("Erreur lors de l'annulation du rendez-vous");
        console.error(error);
      }
    }
  };

  const handleCreateFacture = async (e) => {
    e.preventDefault();
    try {
      await receptionnisteService.createFacture({
        montant: parseFloat(formData.factureMontant),
        patientId: parseInt(formData.facturePatientId),
        consultationId: formData.factureConsultationId ? parseInt(formData.factureConsultationId) : undefined
      });
      
      alert("Facture créée avec succès !");
      setShowFactureModal(false);
      setFormData({
        factureMontant: "",
        facturePatientId: "",
        factureConsultationId: ""
      });
      
      await loadData();
    } catch (error) {
      alert("Erreur lors de la création de la facture");
      console.error(error);
    }
  };

  const handleMarkFactureAsPaid = async (id) => {
    try {
      await receptionnisteService.markFactureAsPaid(id);
      alert("Facture marquée comme payée !");
      await loadData();
    } catch (error) {
      alert("Erreur lors du marquage de la facture");
      console.error(error);
    }
  };

  // 🔹 Création d'un nouveau patient
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!patientFormData.name || !patientFormData.email || !patientFormData.password || !patientFormData.dateNaissance) {
      alert("❌ Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientFormData.email)) {
      alert("❌ Email invalide");
      return;
    }

    // Validation mot de passe (minimum 6 caractères)
    if (patientFormData.password.length < 6) {
      alert("❌ Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await receptionnisteService.createPatient({
        name: patientFormData.name.trim(),
        email: patientFormData.email.trim().toLowerCase(),
        password: patientFormData.password,
        dateNaissance: patientFormData.dateNaissance,
        antecedents: patientFormData.antecedents.trim() || undefined
      });
      
      alert("✅ Patient créé avec succès !");
      setShowPatientModal(false);
      setPatientFormData({
        name: "",
        email: "",
        password: "",
        dateNaissance: "",
        antecedents: ""
      });
      
      await loadData();
    } catch (error) {
      console.error("Erreur création patient:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`❌ Erreur lors de la création du patient: ${errorMessage}`);
    }
  };

  // 🔹 Fonction pour vérifier si deux dates sont le même jour
  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // 🔹 Filtrer les rendez-vous d'aujourd'hui
  const rendezVousAujourdhui = data.rendezVous.filter(rdv => 
    isSameDay(rdv.date, new Date())
  );

  // Statistiques dynamiques
  const stats = {
    totalRendezVous: data.rendezVous.length,
    rdvAujourdhui: rendezVousAujourdhui.length,
    facturesImpayees: data.factures.filter(f => f.statut === "Non payé").length,
    chiffreAffaires: data.factures
      .filter(f => f.statut === "Payé")
      .reduce((sum, f) => sum + f.montant, 0)
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reception-dashboard">
      {/* Sidebar */}
      <aside className="reception-sidebar">
        <h2>💼 Réception</h2>
        <button 
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Tableau de bord
        </button>
        <button 
          className={activeTab === "rendezvous" ? "active" : ""}
          onClick={() => setActiveTab("rendezvous")}
        >
          📅 Rendez-vous
        </button>
        <button 
          className={activeTab === "factures" ? "active" : ""}
          onClick={() => setActiveTab("factures")}
        >
          💰 Factures
        </button>
        <button 
          className={activeTab === "patients" ? "active" : ""}
          onClick={() => setActiveTab("patients")}
        >
          👥 Patients
        </button>
        <button onClick={handleLogout} className="reception-logout-btn">
          🚪 Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="reception-main">
        {/* Header */}
        <header className="reception-header">
          <div className="reception-header-left">
            <h1>Portail Réceptionniste MedFlow</h1>
            <div className="reception-welcome">Bienvenue, {receptionnisteInfo.name}</div>
          </div>
          <div className="reception-header-actions">
            <button className="reception-notif-btn">🔔</button>
            <span className="reception-name">{receptionnisteInfo.name}</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png"
              alt="Réceptionniste"
              className="reception-avatar"
            />
          </div>
        </header>

        {/* Content */}
        <div className="reception-content">
          {/* Tableau de bord */}
          {activeTab === "dashboard" && (
            <>
              <div className="reception-stats-grid">
                <div className="reception-stat-card">
                  <div className="reception-stat-number">{stats.totalRendezVous}</div>
                  <div className="reception-stat-label">Rendez-vous total</div>
                </div>
                <div className="reception-stat-card">
                  <div className="reception-stat-number">{stats.rdvAujourdhui}</div>
                  <div className="reception-stat-label">RDV aujourd'hui</div>
                </div>
                <div className="reception-stat-card">
                  <div className="reception-stat-number">{stats.facturesImpayees}</div>
                  <div className="reception-stat-label">Factures impayées</div>
                </div>
                <div className="reception-stat-card">
                  <div className="reception-stat-number">{stats.chiffreAffaires}€</div>
                  <div className="reception-stat-label">Chiffre d'affaires</div>
                </div>
              </div>

              <div className="reception-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>📅 Rendez-vous du jour</h2>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate("/reception/rendezvous/new")}
                  >
                    + Nouveau RDV
                  </button>
                </div>
                {rendezVousAujourdhui.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <p>Aucun rendez-vous aujourd'hui</p>
                  </div>
                ) : (
                  <table className="reception-table">
                    <thead>
                      <tr>
                        <th>Heure</th>
                        <th>Patient</th>
                        <th>Médecin</th>
                        <th>Motif</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rendezVousAujourdhui
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(rdv => (
                          <tr key={rdv.id}>
                            <td>{new Date(rdv.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{rdv.patient?.user?.name || "Inconnu"}</td>
                            <td>Dr. {rdv.medecin?.user?.name || "Inconnu"}</td>
                            <td>{rdv.motif}</td>
                            <td>
                              <span className={`status-badge status-${rdv.status?.toLowerCase().replace('é', 'e') || 'programme'}`}>
                                {rdv.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-danger"
                                onClick={() => handleCancelRendezVous(rdv.id)}
                                disabled={rdv.status === "Annulé"}
                              >
                                Annuler
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="reception-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>💰 Factures en attente</h2>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowFactureModal(true)}
                  >
                    + Nouvelle Facture
                  </button>
                </div>
                {data.factures.filter(f => f.statut === "Non payé").length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <p>Toutes les factures sont payées</p>
                  </div>
                ) : (
                  <table className="reception-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.factures
                        .filter(f => f.statut === "Non payé")
                        .map(facture => (
                          <tr key={facture.id}>
                            <td>{new Date(facture.date).toLocaleDateString('fr-FR')}</td>
                            <td>{facture.patient?.user?.name || "Inconnu"}</td>
                            <td>{facture.montant} €</td>
                            <td>
                              <span className={`status-badge status-${facture.statut?.toLowerCase().replace(' ', '-') || 'non-paye'}`}>
                                {facture.statut}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-secondary"
                                onClick={() => handleMarkFactureAsPaid(facture.id)}
                              >
                                Marquer payé
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Gestion des Rendez-vous */}
          {activeTab === "rendezvous" && (
            <div className="reception-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📅 Gestion des Rendez-vous</h2>
                <button 
                  className="btn-primary"
                  onClick={() => navigate("/reception/rendezvous/new")}
                >
                  + Nouveau RDV
                </button>
              </div>
              
              {data.rendezVous.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <p>Aucun rendez-vous programmé</p>
                </div>
              ) : (
                <table className="reception-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Patient</th>
                      <th>Médecin</th>
                      <th>Motif</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rendezVous
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(rdv => (
                        <tr key={rdv.id}>
                          <td>{new Date(rdv.date).toLocaleDateString('fr-FR')}</td>
                          <td>{new Date(rdv.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>{rdv.patient?.user?.name || "Inconnu"}</td>
                          <td>Dr. {rdv.medecin?.user?.name || "Inconnu"}</td>
                          <td>{rdv.motif}</td>
                          <td>
                            <span className={`status-badge status-${rdv.status?.toLowerCase().replace('é', 'e') || 'programme'}`}>
                              {rdv.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn-danger"
                                onClick={() => handleCancelRendezVous(rdv.id)}
                                disabled={rdv.status === "Annulé"}
                              >
                                Annuler
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Gestion des Factures */}
          {activeTab === "factures" && (
            <div className="reception-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>💰 Gestion des Factures</h2>
                <button 
                  className="btn-primary"
                  onClick={() => setShowFactureModal(true)}
                >
                  + Nouvelle Facture
                </button>
              </div>
              
              {data.factures.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💰</div>
                  <p>Aucune facture enregistrée</p>
                </div>
              ) : (
                <table className="reception-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Consultation</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.factures.map(facture => (
                      <tr key={facture.id}>
                        <td>{new Date(facture.date).toLocaleDateString('fr-FR')}</td>
                        <td>{facture.patient?.user?.name || "Inconnu"}</td>
                        <td>{facture.consultation?.diagnostic || "Consultation"}</td>
                        <td>{facture.montant} €</td>
                        <td>
                          <span className={`status-badge status-${facture.statut?.toLowerCase().replace(' ', '-') || 'non-paye'}`}>
                            {facture.statut}
                          </span>
                        </td>
                        <td>
                          {facture.statut === "Non payé" && (
                            <button 
                              className="btn-secondary"
                              onClick={() => handleMarkFactureAsPaid(facture.id)}
                            >
                              Marquer payé
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Gestion des Patients */}
          {activeTab === "patients" && (
            <div className="reception-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👥 Gestion des Patients</h2>
                <button 
                  className="btn-primary"
                  onClick={() => setShowPatientModal(true)}
                >
                  + Nouveau Patient
                </button>
              </div>
              
              {data.patients.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <p>Aucun patient enregistré</p>
                </div>
              ) : (
                <table className="reception-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Date de naissance</th>
                      <th>Antécédents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.patients.map(patient => (
                      <tr key={patient.id}>
                        <td>{patient.id}</td>
                        <td>{patient.user?.name || "Inconnu"}</td>
                        <td>{patient.user?.email || "Inconnu"}</td>
                        <td>{new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}</td>
                        <td>{patient.antecedents || "—"}</td>
                        <td>
                          <button className="btn-secondary">
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Nouveau Patient */}
      {showPatientModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>👤 Nouveau Patient</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowPatientModal(false);
                  setPatientFormData({
                    name: "",
                    email: "",
                    password: "",
                    dateNaissance: "",
                    antecedents: ""
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="reception-form">
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  value={patientFormData.name}
                  onChange={(e) => setPatientFormData({...patientFormData, name: e.target.value})}
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={patientFormData.email}
                  onChange={(e) => setPatientFormData({...patientFormData, email: e.target.value})}
                  placeholder="Ex: jean.dupont@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={patientFormData.password}
                  onChange={(e) => setPatientFormData({...patientFormData, password: e.target.value})}
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="form-group">
                <label>Date de naissance *</label>
                <input
                  type="date"
                  value={patientFormData.dateNaissance}
                  onChange={(e) => setPatientFormData({...patientFormData, dateNaissance: e.target.value})}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group reception-form-full">
                <label>Antécédents médicaux (optionnel)</label>
                <textarea
                  value={patientFormData.antecedents}
                  onChange={(e) => setPatientFormData({...patientFormData, antecedents: e.target.value})}
                  placeholder="Ex: Diabète, hypertension, allergies..."
                  rows="4"
                />
              </div>
              
              <div className="reception-form-full" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-danger"
                  onClick={() => {
                    setShowPatientModal(false);
                    setPatientFormData({
                      name: "",
                      email: "",
                      password: "",
                      dateNaissance: "",
                      antecedents: ""
                    });
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer le patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Facture */}
      {showFactureModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>💰 Nouvelle Facture</h2>
              <button 
                className="modal-close"
                onClick={() => setShowFactureModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateFacture} className="reception-form">
              <div className="form-group">
                <label>Patient</label>
                <select
                  value={formData.facturePatientId}
                  onChange={(e) => setFormData({...formData, facturePatientId: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {data.patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.user?.name || `Patient ${patient.id}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.factureMontant}
                  onChange={(e) => setFormData({...formData, factureMontant: e.target.value})}
                  placeholder="Ex: 50.00"
                  required
                />
              </div>
              
              <div className="form-group reception-form-full">
                <label>Consultation (optionnel)</label>
                <select
                  value={formData.factureConsultationId}
                  onChange={(e) => setFormData({...formData, factureConsultationId: e.target.value})}
                >
                  <option value="">Sélectionner une consultation</option>
                  {data.consultations.map(consultation => (
                    <option key={consultation.id} value={consultation.id}>
                      {`Consultation ${consultation.id} - ${consultation.patient?.user?.name} (${new Date(consultation.date).toLocaleDateString('fr-FR')})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="reception-form-full" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-danger"
                  onClick={() => setShowFactureModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer la facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}