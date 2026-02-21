// frontend/src/services/admin.js
import api from './api';

export const adminService = {
  // 🔹 Créer un médecin
  createMedecin: async (data) => {
    try {
      const response = await api.post('/admin/create-medecin', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création médecin:', error);
      throw error;
    }
  },

  // 🔹 Créer un réceptionniste
  createReceptionniste: async (data) => {
    try {
      const response = await api.post('/admin/create-receptionniste', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création réceptionniste:', error);
      throw error;
    }
  },

  // 🔹 Récupérer tout le personnel
  getAllStaff: async () => {
    try {
      const response = await api.get('/admin/staff');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération personnel:', error);
      throw error;
    }
  },

  // 🔹 Récupérer les médecins
  getMedecins: async () => {
    try {
      const response = await api.get('/admin/staff/medecins');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération médecins:', error);
      throw error;
    }
  },

  // 🔹 Récupérer les réceptionnistes
  getReceptionnistes: async () => {
    try {
      const response = await api.get('/admin/staff/receptionnistes');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération réceptionnistes:', error);
      throw error;
    }
  },

  // 🔹 Supprimer un membre du personnel
  deleteStaff: async (userId) => {
    try {
      const response = await api.post(`/admin/staff/${userId}/delete`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression personnel:', error);
      throw error;
    }
  },

  // 🔹 Statistiques du dashboard
  getDashboardStats: async (period = 'month') => {
    try {
      const response = await api.get('/admin/dashboard', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      throw error;
    }
  },

  // 🔹 Mettre à jour un service
  updateService: async (data) => {
    try {
      const response = await api.put('/admin/update-service', data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour service:', error);
      throw error;
    }
  },

  // 🔹 Récupérer tous les patients
  getAllPatients: async () => {
    try {
      const response = await api.get('/admin/patients');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération patients:', error);
      throw error;
    }
  },

  // 🔹 Statistiques de revenus
  getRevenueStats: async (year) => {
    try {
      const response = await api.get('/admin/stats/revenue', {
        params: year ? { year } : {}
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération revenus:', error);
      throw error;
    }
  }
};