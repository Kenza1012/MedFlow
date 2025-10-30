// src/services/patient.js
import api from "./api";
const BASE_URL = "http://localhost:3000";
/** 
 * 🔹 Récupère le token JWT stocké dans le navigateur
 */
const getToken = () => localStorage.getItem("token") || localStorage.getItem("access_token");

/**
 * 🔹 Retourne les headers d'authentification pour Axios
 */
const getAuthHeaders = () => ({
  headers: { Authorization: Bearer ${getToken()} },
});

/**
 * 🧑‍⚕️ Récupérer les informations d'un patient par userId
 */
export async function fetchPatientInfo(userId) {
  try {
    const res = await api.get(${BASE_URL}/patients/user/${userId}, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("❌ Erreur fetchPatientInfo:", error.response?.data || error.message);
    return null;
  }
}

/**
 * 📅 Récupérer la liste des rendez-vous du patient
 */
export async function fetchRendezVous(userId) {
  try {
    const res = await api.get(${BASE_URL}/patients/${userId}/rendezvous, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("❌ Erreur fetchRendezVous:", error.response?.data || error.message);
    return [];
  }
}

/**
 * 💳 Récupérer la liste des factures du patient
 */
export async function fetchFactures(userId) {
  try {
    const res = await api.get(${BASE_URL}/patients/${userId}/factures, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error("❌ Erreur fetchFactures:", error.response?.data || error.message);
    return [];
  }
}
localhost