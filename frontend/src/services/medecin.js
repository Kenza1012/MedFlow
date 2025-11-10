import axios from "axios";

const BASE_URL = "http://localhost:3000";

// 🔹 Récupérer le token depuis localStorage
const getToken = () => localStorage.getItem("token");

// 🔹 Récupérer les rendez-vous du médecin connecté
export const getRendezVous = async () => {
  const token = getToken();
  if (!token) {
    console.warn(" Token manquant pour getRendezVous");
    return [];
  }
  try {
    const res = await axios.get(`${BASE_URL}/medecin/rendezvous`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur getRendezVous:", err.response?.data || err);
    return [];
  }
};

// 🔹 Récupérer les consultations du médecin connecté
export const getConsultations = async () => {
  const token = getToken();
  if (!token) {
    console.warn(" Token manquant pour getConsultations");
    return [];
  }
  try {
    const res = await axios.get(`${BASE_URL}/medecin/consultations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur getConsultations:", err.response?.data || err);
    return [];
  }
};

// 🔹 Ajouter une consultation
export const addConsultation = async ({ patientId, diagnostic, prescription }) => {
  const token = getToken();
  if (!token || !patientId) throw new Error("Token ou patientId manquant");
  try {
    const res = await axios.post(
      `${BASE_URL}/medecin/consultations`,
      { patientId, diagnostic, prescription },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Erreur addConsultation:", err.response?.data || err);
    throw err;
  }
};

// 🔹 Télécharger ordonnance
 export async function downloadOrdonnance(consultationId) {
  try {
    const response = await fetch(`http://localhost:3000/medecin/ordonnance/${consultationId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // ✅ On reçoit bien un fichier binaire
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ordonnance_${consultationId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
    console.log("✅ PDF téléchargé avec succès !");
  } catch (error) {
    console.error("Erreur downloadOrdonnance:", error);
  }


};


