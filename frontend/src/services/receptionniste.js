import api from './api';

export const receptionnisteService = {
  // 🔹 Rendez-vous
  createRendezVous: async (data) => {
    try {
      const response = await api.post('/reception/rendezvous', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      throw error;
    }
  },

  updateRendezVous: async (id, data) => {   
    try {
      const response = await api.put(`/reception/rendezvous/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur modification rendez-vous:', error);
      throw error;
    }
  },

  cancelRendezVous: async (id) => {
    try {
      const response = await api.delete(`/reception/rendezvous/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
      throw error;
    }
  },

  getAllRendezVous: async () => {
    try {
      const response = await api.get('/reception/rendezvous');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
      throw error;
    }
  },

  // 🔹 Factures
  createFacture: async (data) => {
    try {
      const response = await api.post('/reception/facture', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création facture:', error);
      throw error;
    }
  },

  getAllFactures: async () => {
    try {
      const response = await api.get('/reception/factures');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération factures:', error);
      throw error;
    }
  },

  markFactureAsPaid: async (id) => {
    try {
      const response = await api.patch(`/reception/facture/${id}/payer`);
      return response.data;
    } catch (error) {
      console.error('Erreur paiement facture:', error);
      throw error;
    }
  },

  getFacturesByPatient: async (patientId) => {
    try {
      const response = await api.get(`/reception/factures/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération factures patient:', error);
      throw error;
    }
  },

  // 🔹 NOUVEAU : Récupérer tous les patients
  getAllPatients: async () => {
    try {
      const response = await api.get('/reception/patients');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération patients:', error);
      throw error;
    }
  },

  // 🔹 NOUVEAU : Récupérer tous les médecins
  getAllMedecins: async () => {
    try {
      const response = await api.get('/reception/medecins');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération médecins:', error);
      throw error;
    }
  },

  // 🔹 NOUVEAU : Récupérer toutes les consultations
  getAllConsultations: async () => {
    try {
      const response = await api.get('/reception/consultations');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération consultations:', error);
      throw error;
    }
  }
};