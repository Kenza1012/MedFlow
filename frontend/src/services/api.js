import axios from 'axios';

// ✅ Configuration de l'URL de base de l'API
const api = axios.create({
  baseURL: 'http://localhost:3000', // Changez selon votre configuration
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Intercepteur pour ajouter automatiquement le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token ajouté à la requête:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ Aucun token trouvé');
    }
    
    console.log('📤 Requête API:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

// ✅ Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse API:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse API:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      data: error.response?.data
    });

    // Si le token est expiré ou invalide (401), rediriger vers la connexion
    if (error.response?.status === 401) {
      console.warn('🚫 Session expirée, redirection vers login');
      localStorage.clear();
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;