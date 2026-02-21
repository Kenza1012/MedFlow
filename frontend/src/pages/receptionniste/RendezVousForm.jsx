import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { receptionnisteService } from "../../services/receptionniste";
import decodeJWT from "../../services/decodeJWT";
import "./RendezVousForm.css";

export default function RendezVousForm() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateHeure: "",
    motif: "",
    patientId: "",
    medecinId: "",
  });

  // 🔹 Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      alert("🚫 Vous devez être connecté pour créer un rendez-vous");
      navigate("/");
      return;
    }

    const decodedToken = decodeJWT(token);
    console.log("🔐 Token décodé:", decodedToken);
    
    if (decodedToken?.role !== "RECEPTIONNISTE") {
      alert("🚫 Accès réservé aux réceptionnistes");
      navigate("/reception/dashboard");
      return;
    }
  }, [navigate]);

  // 🔹 Charger la liste des patients et médecins
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, medecinsRes] = await Promise.all([
          receptionnisteService.getAllPatients(),
          receptionnisteService.getAllMedecins()
        ]);

        console.log("📋 Patients reçus:", patientsRes);
        console.log("👨‍⚕️ Médecins reçus:", medecinsRes);

        setPatients(Array.isArray(patientsRes) ? patientsRes : []);
        setMedecins(Array.isArray(medecinsRes) ? medecinsRes : []);
        
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error);
        alert("Erreur lors du chargement des données: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Création du rendez-vous
  const handleCreateRendezVous = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      alert("🚫 Token manquant. Veuillez vous reconnecter.");
      navigate("/");
      return;
    }

    // ✅ Validation des données
    if (!formData.dateHeure || !formData.patientId || !formData.medecinId) {
      alert("❌ Veuillez remplir tous les champs obligatoires");
      setLoading(false);
      return;
    }

    // ✅ Le backend attend "date" et non "dateHeure"
    const data = {
      date: formData.dateHeure,
      motif: formData.motif || "Consultation générale",
      patientId: parseInt(formData.patientId),
      medecinId: parseInt(formData.medecinId),
    };

    console.log("📤 Données envoyées au backend:", data);

    try {
      const response = await receptionnisteService.createRendezVous(data);
      console.log("✅ Réponse backend:", response);

      alert("✅ Rendez-vous créé avec succès !");
      navigate("/reception/dashboard");
    } catch (error) {
      console.error("❌ Erreur détaillée:", error);
      
      const errorMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 401) {
        alert("🚫 Session expirée. Veuillez vous reconnecter.");
        localStorage.clear();
        navigate("/");
      } else if (error.response?.status === 400) {
        alert(`❌ Données invalides: ${errorMessage}`);
      } else if (error.response?.status === 404) {
        alert(`❌ ${errorMessage}`);
      } else {
        alert(`❌ Erreur lors de la création du rendez-vous: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && patients.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="rendezvous-form-container">
      <div className="form-header">
        <h2>📅 Nouveau Rendez-vous</h2>
        <button 
          className="btn-back"
          onClick={() => navigate("/reception/dashboard")}
        >
          ← Retour
        </button>
      </div>

      <form onSubmit={handleCreateRendezVous} className="rendezvous-form">
        <div className="form-group">
          <label>Date et heure *</label>
          <input
            type="datetime-local"
            name="dateHeure"
            value={formData.dateHeure}
            onChange={handleChange}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="form-group">
          <label>Patient *</label>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            disabled={patients.length === 0}
          >
            <option value="">Sélectionner un patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.user?.name || patient.name} - {patient.user?.email || patient.email}
              </option>
            ))}
          </select>
          {patients.length === 0 && <small className="error-text">Aucun patient disponible</small>}
        </div>

        <div className="form-group">
          <label>Médecin *</label>
          <select
            name="medecinId"
            value={formData.medecinId}
            onChange={handleChange}
            required
            disabled={medecins.length === 0}
          >
            <option value="">Sélectionner un médecin</option>
            {medecins.map(medecin => (
              <option key={medecin.id} value={medecin.id}>
                Dr. {medecin.user?.name || medecin.name} - {medecin.specialite || 'Généraliste'}
              </option>
            ))}
          </select>
          {medecins.length === 0 && <small className="error-text">Aucun médecin disponible</small>}
        </div>

        <div className="form-group">
          <label>Motif de consultation</label>
          <textarea
            name="motif"
            value={formData.motif}
            onChange={handleChange}
            placeholder="Ex: Consultation générale, Suivi médical, Contrôle..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/reception/dashboard")}
            disabled={loading}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || !formData.dateHeure || !formData.patientId || !formData.medecinId}
          >
            {loading ? "Création..." : "Créer le RDV"}
          </button>
        </div>
      </form>
    </div>
  );
}