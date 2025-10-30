import api from './api';

export const patientService = {
  // Récupérer les rendez-vous du patient
  getRendezVous: async () => {
    try {
      const response = await api.get('/patient/rendezvous');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
      // Données mockées pour la démo si le backend n'est pas prêt
      return [
        
      ];
    }
  },

  // Récupérer les factures du patient
  getFactures: async () => {
    try {
      const response = await api.get('/patient/factures');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération factures:', error);
      // Données mockées
      return [
        { 
          id: 1, 
          date: "2025-10-15T00:00:00.000Z", 
          montant: 50, 
          statut: "Payé", 
          consultation: { diagnostic: "Consultation du 15/10" } 
        },
        { 
          id: 2, 
          date: "2025-10-18T00:00:00.000Z", 
          montant: 75, 
          statut: "Non payé", 
          consultation: { diagnostic: "Analyse sanguine" } 
        }
      ];
    }
  },

  // Récupérer les ordonnances du patient
  getOrdonnances: async () => {
    try {
      const response = await api.get('/patient/ordonnances');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération ordonnances:', error);
      // Données mockées
      return [
        { 
          id: 1, 
          date: "2025-10-15T00:00:00.000Z", 
          medecin: { user: { name: "Dr. Ahmed" } }, 
          diagnostic: "Prescription médicale",
          prescription: "Paracétamol 500mg"
        },
        { 
          id: 2, 
          date: "2025-09-20T00:00:00.000Z", 
          medecin: { user: { name: "Dr. Marie" } }, 
          diagnostic: "Carence vitamine D",
          prescription: "Vitamine D 1000UI"
        }
      ];
    }
  },

  // Annuler un rendez-vous
  annulerRendezVous: async (id) => {
    try {
      const response = await api.delete(`/patient/rendezvous/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
      throw error;
    }
  },

  // Payer une facture
  payerFacture: async (factureId) => {
    try {
      const response = await api.post('/patient/paiement', { factureId });
      return response.data;
    } catch (error) {
      console.error('Erreur paiement facture:', error);
      throw error;
    }
  },

  // Télécharger une ordonnance
  downloadOrdonnance: async (ordonnanceId) => {
    try {
      const response = await api.get(`/patient/ordonnance/${ordonnanceId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur téléchargement ordonnance:', error);
      throw error;
    }
  }
};