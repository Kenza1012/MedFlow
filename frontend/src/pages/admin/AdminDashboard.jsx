// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/admin";
import '../../styles/global.css';
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

  const adminInfo = {
    name: JSON.parse(localStorage.getItem("user") || "{}")?.name || "Admin",
    email: JSON.parse(localStorage.getItem("user") || "{}")?.email || "admin@medflow.com",
  };

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
      <div className="loading">
        <div className="spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar gradient-admin">
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
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>🏥 MedFlow - Administration</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '5px' }}>
              Tableau de bord administrateur
            </p>
          </div>
          <div className="header-actions">
            <span className="admin-name">{adminInfo.name}</span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/4339/4339520.png"
              alt="Admin Avatar"
              className="admin-avatar"
            />
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && stats && (
            <>
              {/* Period Selector */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  className={period === "day" ? "btn-primary" : "btn-secondary"}
                  onClick={() => setPeriod("day")}
                >
                  Jour
                </button>
                <button
                  className={period === "week" ? "btn-primary" : "btn-secondary"}
                  onClick={() => setPeriod("week")}
                >
                  Semaine
                </button>
                <button
                  className={period === "month" ? "btn-primary" : "btn-secondary"}
                  onClick={() => setPeriod("month")}
                >
                  Mois
                </button>
                <button
                  className={period === "year" ? "btn-primary" : "btn-secondary"}
                  onClick={() => setPeriod("year")}
                >
                  Année
                </button>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="stat-card" style={{ '--color-start': '#3b82f6', '--color-end': '#2563eb' }}>
                  <div style={{ fontSize: '2.5rem' }}>👥</div>
                  <div>
                    <div className="stat-number">{stats.staff.total}</div>
                    <div className="stat-label">Total Personnel</div>
                    <small style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {stats.staff.medecins} médecins • {stats.staff.receptionnistes} réceptionnistes
                    </small>
                  </div>
                </div>

                <div className="stat-card" style={{ '--color-start': '#10b981', '--color-end': '#059669' }}>
                  <div style={{ fontSize: '2.5rem' }}>🏥</div>
                  <div>
                    <div className="stat-number">{stats.staff.patients}</div>
                    <div className="stat-label">Patients</div>
                    <small style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total enregistrés</small>
                  </div>
                </div>

                <div className="stat-card" style={{ '--color-start': '#8b5cf6', '--color-end': '#7c3aed' }}>
                  <div style={{ fontSize: '2.5rem' }}>💰</div>
                  <div>
                    <div className="stat-number">{stats.finance.chiffreAffaires} DT</div>
                    <div className="stat-label">Chiffre d'Affaires</div>
                    <small style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {stats.finance.facturesPayees}/{stats.finance.totalFactures} factures payées
                    </small>
                  </div>
                </div>

                <div className="stat-card" style={{ '--color-start': '#f59e0b', '--color-end': '#d97706' }}>
                  <div style={{ fontSize: '2.5rem' }}>📅</div>
                  <div>
                    <div className="stat-number">{stats.activite.totalRendezVous}</div>
                    <div className="stat-label">Rendez-vous</div>
                    <small style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {stats.activite.rendezVousAujourdhui} aujourd'hui
                    </small>
                  </div>
                </div>
              </div>

              {/* Charts */}
              {revenueStats && (
                <div className="card">
                  <h2>📈 Revenus mensuels ({revenueStats.year})</h2>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', height: '250px', padding: '20px', background: '#f9fafb', borderRadius: 'var(--radius-md)', marginTop: '20px' }}>
                    {revenueStats.monthlyRevenue.map((month, idx) => (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${(month.revenue / Math.max(...revenueStats.monthlyRevenue.map(m => m.revenue))) * 200}px`,
                            background: 'linear-gradient(180deg, var(--primary), #0097a7)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'all 0.3s ease'
                          }}
                          title={`${month.revenue} DT`}
                        ></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{month.month}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', background: '#f9fafb', borderRadius: 'var(--radius-md)', marginTop: '15px' }}>
                    <p><strong>Total:</strong> {revenueStats.totalRevenue.toFixed(2)} DT</p>
                    <p><strong>Factures:</strong> {revenueStats.totalFactures}</p>
                  </div>
                </div>
              )}

              {/* Activity Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="card">
                  <h3>📋 Consultations</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', margin: '10px 0' }}>
                    {stats.activite.totalConsultations}
                  </div>
                  <p>Total sur la période</p>
                </div>
                <div className="card">
                  <h3>💳 Taux de paiement</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', margin: '10px 0' }}>
                    {stats.finance.tauxPaiement}%
                  </div>
                  <p>Factures payées</p>
                </div>
                <div className="card">
                  <h3>⚠️ Impayés</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ef4444', margin: '10px 0' }}>
                    {stats.finance.facturesImpayees}
                  </div>
                  <p>Factures en attente</p>
                </div>
              </div>
            </>
          )}

          {/* PERSONNEL */}
          {activeTab === "staff" && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👥 Gestion du Personnel</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={() => setShowMedecinModal(true)}>
                    + Nouveau Médecin
                  </button>
                  <button className="btn-secondary" onClick={() => setShowReceptionModal(true)}>
                    + Nouveau Réceptionniste
                  </button>
                </div>
              </div>

              {/* Médecins */}
              <div className="card">
                <h3>👨‍⚕️ Médecins ({staff.medecins.length})</h3>
                {staff.medecins.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👨‍⚕️</div>
                    <p>Aucun médecin enregistré</p>
                  </div>
                ) : (
                  <table className="table">
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
                              className="btn-danger"
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
              <div className="card">
                <h3>💼 Réceptionnistes ({staff.receptionnistes.length})</h3>
                {staff.receptionnistes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💼</div>
                    <p>Aucun réceptionniste enregistré</p>
                  </div>
                ) : (
                  <table className="table">
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
                              className="btn-danger"
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
            <div className="card">
              <h2>🏥 Liste des Patients ({patients.length})</h2>
              {patients.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏥</div>
                  <p>Aucun patient enregistré</p>
                </div>
              ) : (
                <table className="table">
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
            <div className="card">
              <h2>💰 Statistiques Financières</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', marginBottom: '10px' }}>Chiffre d'Affaires</h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981', margin: '0' }}>
                    {stats.finance.chiffreAffaires} DT
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', marginBottom: '10px' }}>Factures Payées</h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', margin: '0' }}>
                    {stats.finance.facturesPayees}
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', marginBottom: '10px' }}>Factures Impayées</h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ef4444', margin: '0' }}>
                    {stats.finance.facturesImpayees}
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', marginBottom: '10px' }}>Taux de Paiement</h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', margin: '0' }}>
                    {stats.finance.tauxPaiement}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Nouveau Médecin */}
      {showMedecinModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowMedecinModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>👨‍⚕️ Nouveau Médecin</h2>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  color: 'var(--text-light)'
                }}
                onClick={() => setShowMedecinModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateMedecin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nom complet *</label>
                <input
                  type="text"
                  value={medecinForm.name}
                  onChange={(e) => setMedecinForm({ ...medecinForm, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  value={medecinForm.email}
                  onChange={(e) => setMedecinForm({ ...medecinForm, email: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mot de passe *</label>
                <input
                  type="password"
                  value={medecinForm.password}
                  onChange={(e) => setMedecinForm({ ...medecinForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Spécialité *</label>
                <input
                  type="text"
                  value={medecinForm.specialite}
                  onChange={(e) => setMedecinForm({ ...medecinForm, specialite: e.target.value })}
                  placeholder="Ex: Cardiologue, Pédiatre..."
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowMedecinModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouveau Réceptionniste */}
      {showReceptionModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowReceptionModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>💼 Nouveau Réceptionniste</h2>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  color: 'var(--text-light)'
                }}
                onClick={() => setShowReceptionModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateReceptionniste}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nom complet *</label>
                <input
                  type="text"
                  value={receptionForm.name}
                  onChange={(e) => setReceptionForm({ ...receptionForm, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  value={receptionForm.email}
                  onChange={(e) => setReceptionForm({ ...receptionForm, email: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mot de passe *</label>
                <input
                  type="password"
                  value={receptionForm.password}
                  onChange={(e) => setReceptionForm({ ...receptionForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowReceptionModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}