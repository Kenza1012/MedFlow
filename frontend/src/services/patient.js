// frontend/src/services/patient.js

import api from "./api";

const getToken = () => localStorage.getItem("token") || localStorage.getItem("access_token");

/**
 * 🧑‍⚕️ Récupérer les informations d'un patient par userId
 */
export async function fetchPatientInfo(userId) {
  try {
    // ✅ CORRECTION: Passer userId directement (nombre)
    const id = typeof userId === "object" ? userId.id : userId;
    
    if (!id) {
      throw new Error("userId manquant");
    }

    // ✅ Utiliser api.get avec la bonne syntaxe
    const response = await api.get(`/patients/user/${id}`);
    console.log("✅ Patient info reçue:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur fetchPatientInfo:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      userId
    });
    throw error;
  }
}

/**
 * 📅 Récupérer les rendez-vous du patient
 */
export async function fetchRendezVous(patientId) {
  try {
    const id = typeof patientId === "object" ? patientId.id : patientId;
    
    if (!id) {
      throw new Error("patientId manquant");
    }

    const response = await api.get(`/patients/${id}/rendezvous`);
    console.log("✅ Rendez-vous reçus:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur fetchRendezVous:", error.response?.data || error.message);
    return [];
  }
}

/**
 * 💳 Récupérer les factures du patient
 */
export async function fetchFactures(patientId) {
  try {
    const id = typeof patientId === "object" ? patientId.id : patientId;
    
    if (!id) {
      throw new Error("patientId manquant");
    }

    const response = await api.get(`/patients/${id}/factures`);
    console.log("✅ Factures reçues:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur fetchFactures:", error.response?.data || error.message);
    return [];
  }
}

/**
 * ✅ Récupérer la liste des médecins disponibles
 */
export async function fetchMedecinsDisponibles() {
  try {
    const response = await api.get(`/medecin`);
    console.log("✅ Médecins reçus:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur fetchMedecinsDisponibles:", error.response?.data || error.message);
    return [];
  }
}

/**
 * ✅ Réserver un rendez-vous
 */
export async function reserverRendezVous(data) {
  try {
    console.log("📤 Réservation RDV:", data);
    const response = await api.post(`/rendezvous`, data);
    console.log("✅ RDV réservé:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur reservation:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * ❌ Annuler un rendez-vous
 */
export async function annulerRendezVous(rdvId) {
  try {
    const response = await api.patch(`/rendezvous/${rdvId}/annuler`, {});
    console.log("✅ RDV annulé:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur annulation:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * ✏️ Modifier un rendez-vous
 */
export async function modifierRendezVous(rdvId, data) {
  try {
    const response = await api.patch(`/rendezvous/${rdvId}`, data);
    console.log("✅ RDV modifié:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur modification:", error.response?.data || error.message);
    throw error;
  }
}