// src/services/patient.js
import api from "./api";
const BASE_URL = "http://localhost:3000";

const getToken = () => localStorage.getItem("token") || localStorage.getItem("access_token");

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

/**
 * 🧑‍⚕️ Récupérer les informations d'un patient par userId
 */
export async function fetchPatientInfo(user) {
  try {
    const userId = typeof user === "object" ? user.id : user;
    const res = await api.get(`${BASE_URL}/patients/user/${userId}`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("❌ Erreur fetchPatientInfo:", error.response?.data || error.message);
    return null;
  }
}

/**
 * 📅 Récupérer la liste des rendez-vous du patient
 */
export async function fetchRendezVous(user) {
  try {
    const userId = typeof user === "object" ? user.id : user;
    const res = await api.get(`${BASE_URL}/patients/${userId}/rendezvous`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("❌ Erreur fetchRendezVous:", error.response?.data || error.message);
    return [];
  }
}

/**
 * 💳 Récupérer la liste des factures du patient
 */
export async function fetchFactures(user) {
  try {
    const userId = typeof user === "object" ? user.id : user;
    const res = await api.get(`${BASE_URL}/patients/${userId}/factures`, getAuthHeaders());
    return res.data;
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
    const token = getToken();
    const response = await api.get(`${BASE_URL}/medecin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur fetchMedecinsDisponibles:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * ✅ Réserver un rendez-vous
 */
export async function reserverRendezVous(data) {
  try {
    const res = await api.post(`${BASE_URL}/rendezvous`, data, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("❌ Erreur reserverRendezVous:", error.response?.data || error.message);
    throw error;
  }
}

