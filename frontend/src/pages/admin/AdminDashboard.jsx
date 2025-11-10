// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/admin";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [showMedecinModal, setShowMedecinModal] = useState(false);
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState({ medecins: [], receptionnistes: [] });
  const [patients, setPatients] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);

  const [medecinForm, setMedecinForm] = useState({
    name: "",
    email: "",
    password: "",
    specialite: "",
  });

  const [receptionForm, setReceptionForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Informations admin
  const adminInfo = {
    name: JSON.parse(localStorage.getItem("user") || "{}")?.name || "Admin",
    email: JSON.parse(localStorage.getItem("user") || "{}")?.email || "admin@medflow.com",
  };

  // Charger les données du dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashStats, staffData, patientsData, revenue] = await Promise.all([
        adminService.getDashboardStats(period),
        adminService.getAllStaff(),
        adminService.getAllPatients(),
        adminService.getRevenueStats(),
      ]);
      
      setStats(dashStats);
      setStaff(staffData);
      setPatients(patientsData);
      setRevenueStats(revenue);
    } catch (error) {
      console.error("❌ Erreur chargement données:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Créer un médecin
  const handleCreateMedecin = async (e) => {
    e.preventDefault();
    
    if (medecinForm.password.length < 6) {
      alert("❌ Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await adminService.createMedecin(medecinForm);
      alert("✅ Médecin créé avec succès !");
      setShowMedecinModal(false);
      setMedecinForm({ name: "", email: "", password: "", specialite: "" });
      await loadDashboardData();
    } catch (error) {
      console.error("❌ Erreur création médecin:", error);
      alert(error.response?.data?.message || "Erreur lors de la création du médecin");
    }
  };

  // Créer un réceptionniste
  const handleCreateReceptionniste = async (e) => {
    e.preventDefault();
    
    if (receptionForm.password.length < 6) {
      alert("❌ Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await adminService.createReceptionniste(receptionForm);
      alert("✅ Réceptionniste créé avec succès !");
      setShowReceptionModal(false);
      setReceptionForm({ name: "", email: "", password: "" });
      await loadDashboardData();
    } catch (error) {
      console.error("❌ Erreur création réceptionniste:", error);
      alert(error.response?.data?.message || "Erreur lors de la création du réceptionniste");
    }
  };

  // Supprimer un membre du personnel
  const handleDeleteStaff = async (userId, name) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
      try {
        await adminService.deleteStaff(userId);
        alert("✅ Personnel supprimé avec succès !");
        await loadDashboardData();
      } catch (error) {
        alert("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2>👨‍💼 Admin</h2>
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={activeTab === "staff" ? "active" : ""}
          onClick={() => setActiveTab("staff")}
        >
          👥 Personnel
        </button>
        <button
          className={activeTab === "patients" ? "active" : ""}
          onClick={() => setActiveTab("patients")}
        >
          🏥 Patients
        </button>
        <button
          className={activeTab === "finance" ? "active" : ""}
          onClick={() => setActiveTab("finance")}
        >
          💰 Finances
        </button>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h1>🏥 MedFlow - Administration</h1>
            <p className="admin-subtitle">Tableau de bord administrateur</p>
          </div>
          <div className="admin-header-actions">
            <button className="notif-btn">🔔</button>
            <span className="admin-name">{adminInfo.name}</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/4339/4339520.png"
              alt="Admin Avatar"
              className="admin-avatar"
            />
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && stats && (
            <>
              {/* Period Selector */}
              <div className="period-selector">
                <button
                  className={period === "day" ? "active" : ""}
                  onClick={() => setPeriod("day")}
                >
                  Jour
                </button>
                <button
                  className={period === "week" ? "active" : ""}
                  onClick={() => setPeriod("week")}
                >
                  Semaine
                </button>
                <button
                  className={period === "month" ? "active" : ""}
                  onClick={() => setPeriod("month")}
                >
                  Mois
                </button>
                <button
                  className={period === "year" ? "active" : ""}
                  onClick={() => setPeriod("year")}
                >
                  Année
                </button>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>{stats.staff.total}</h3>
                    <p>Total Personnel</p>
                    <small>{stats.staff.medecins} médecins • {stats.staff.receptionnistes} réceptionnistes</small>
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-icon">🏥</div>
                  <div className="stat-content">
                    <h3>{stats.staff.patients}</h3>
                    <p>Patients</p>
                    <small>Total enregistrés</small>
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3>{stats.finance.chiffreAffaires} DT</h3>
                    <p>Chiffre d'Affaires</p>
                    <small>{stats.finance.facturesPayees}/{stats.finance.totalFactures} factures payées</small>
                  </div>
                </div>

                <div className="stat-card orange">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3>{stats.activite.totalRendezVous}</h3>
                    <p>Rendez-vous</p>
                    <small>{stats.activite.rendezVousAujourdhui} aujourd'hui</small>
                  </div>
                </div>
              </div>

              {/* Charts */}
              {revenueStats && (
                <div className="admin-card">
                  <h2>📈 Revenus mensuels ({revenueStats.year})</h2>
                  <div className="revenue-chart">
                    {revenueStats.monthlyRevenue.map((month, idx) => (
                      <div key={idx} className="chart-bar">
                        <div
                          className="bar"
                          style={{
                            height: `${(month.revenue / Math.max(...revenueStats.monthlyRevenue.map(m => m.revenue))) * 200}px`,
                          }}
                          title={`${month.revenue} DT`}
                        ></div>
                        <span className="bar-label">{month.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-summary">
                    <p><strong>Total:</strong> {revenueStats.totalRevenue.toFixed(2)} DT</p>
                    <p><strong>Factures:</strong> {revenueStats.totalFactures}</p>
                  </div>
                </div>
              )}

              {/* Activity Summary */}
              <div className="activity-grid">
                <div className="admin-card">
                  <h3>📋 Consultations</h3>
                  <div className="big-number">{stats.activite.totalConsultations}</div>
                  <p>Total sur la période</p>
                </div>
                <div className="admin-card">
                  <h3>💳 Taux de paiement</h3>
                  <div className="big-number">{stats.finance.tauxPaiement}%</div>
                  <p>Factures payées</p>
                </div>
                <div className="admin-card">
                  <h3>⚠️ Impayés</h3>
                  <div className="big-number">{stats.finance.facturesImpayees}</div>
                  <p>Factures en attente</p>
                </div>
              </div>
            </>
          )}

          {/* PERSONNEL */}
          {activeTab === "staff" && (
            <>
              <div className="staff-header">
                <h2>👥 Gestion du Personnel</h2>
                <div className="staff-actions">
                  <button className="btn-primary" onClick={() => setShowMedecinModal(true)}>
                    + Nouveau Médecin
                  </button>
                  <button className="btn-secondary" onClick={() => setShowReceptionModal(true)}>
                    + Nouveau Réceptionniste
                  </button>
                </div>
              </div>

              {/* Médecins */}
              <div className="admin-card">
                <h3>👨‍⚕️ Médecins ({staff.medecins.length})</h3>
                {staff.medecins.length === 0 ? (
                  <p className="empty-text">Aucun médecin enregistré</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Spécialité</th>
                        <th>Date d'ajout</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.medecins.map((medecin) => (
                        <tr key={medecin.id}>
                          <td>{medecin.name}</td>
                          <td>{medecin.email}</td>
                          <td><span className="badge">{medecin.specialite}</span></td>
                          <td>{new Date(medecin.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn-danger-small"
                              onClick={() => handleDeleteStaff(medecin.userId, medecin.name)}
                            >
                              🗑️ Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Réceptionnistes */}
              <div className="admin-card">
                <h3>💼 Réceptionnistes ({staff.receptionnistes.length})</h3>
                {staff.receptionnistes.length === 0 ? (
                  <p className="empty-text">Aucun réceptionniste enregistré</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Date d'ajout</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.receptionnistes.map((reception) => (
                        <tr key={reception.id}>
                          <td>{reception.name}</td>
                          <td>{reception.email}</td>
                          <td>{new Date(reception.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn-danger-small"
                              onClick={() => handleDeleteStaff(reception.userId, reception.name)}
                            >
                              🗑️ Supprimer
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

          {/* PATIENTS */}
          {activeTab === "patients" && (
            <div className="admin-card">
              <h2>🏥 Liste des Patients ({patients.length})</h2>
              {patients.length === 0 ? (
                <p className="empty-text">Aucun patient enregistré</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Consultations</th>
                      <th>RDV</th>
                      <th>Factures</th>
                      <th>Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td>#{patient.id}</td>
                        <td>{patient.user.name}</td>
                        <td>{patient.user.email}</td>
                        <td>{patient._count.consultations}</td>
                        <td>{patient._count.rendezVous}</td>
                        <td>{patient._count.factures}</td>
                        <td>{new Date(patient.user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* FINANCES */}
          {activeTab === "finance" && stats && (
            <div className="admin-card">
              <h2>💰 Statistiques Financières</h2>
              <div className="finance-summary">
                <div className="finance-item">
                  <h3>Chiffre d'Affaires</h3>
                  <p className="big-number green">{stats.finance.chiffreAffaires} DT</p>
                </div>
                <div className="finance-item">
                  <h3>Factures Payées</h3>
                  <p className="big-number">{stats.finance.facturesPayees}</p>
                </div>
                <div className="finance-item">
                  <h3>Factures Impayées</h3>
                  <p className="big-number red">{stats.finance.facturesImpayees}</p>
                </div>
                <div className="finance-item">
                  <h3>Taux de Paiement</h3>
                  <p className="big-number">{stats.finance.tauxPaiement}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Nouveau Médecin */}
      {showMedecinModal && (
        <div className="modal-overlay" onClick={() => setShowMedecinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👨‍⚕️ Nouveau Médecin</h2>
              <button className="modal-close" onClick={() => setShowMedecinModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateMedecin}>
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  value={medecinForm.name}
                  onChange={(e) => setMedecinForm({ ...medecinForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={medecinForm.email}
                  onChange={(e) => setMedecinForm({ ...medecinForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={medecinForm.password}
                  onChange={(e) => setMedecinForm({ ...medecinForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Spécialité *</label>
                <input
                  type="text"
                  value={medecinForm.specialite}
                  onChange={(e) => setMedecinForm({ ...medecinForm, specialite: e.target.value })}
                  placeholder="Ex: Cardiologue, Pédiatre..."
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowMedecinModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouveau Réceptionniste */}
      {showReceptionModal && (
        <div className="modal-overlay" onClick={() => setShowReceptionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💼 Nouveau Réceptionniste</h2>
              <button className="modal-close" onClick={() => setShowReceptionModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateReceptionniste}>
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  value={receptionForm.name}
                  onChange={(e) => setReceptionForm({ ...receptionForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={receptionForm.email}
                  onChange={(e) => setReceptionForm({ ...receptionForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={receptionForm.password}
                  onChange={(e) => setReceptionForm({ ...receptionForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowReceptionModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}