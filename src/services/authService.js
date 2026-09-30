import apiClient from './apiClient';

const authService = {
  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{token: string, user: object}>}
   */
  login: async (username, password) => {
    // --- DUMMY LOGIN UNTUK TESTING FRONTEND ---
    // Karena backend Spring Boot belum ada, kita bypass API sementara
    if (password === '123456') {
      if (username === 'admin') {
        return {
          token: 'dummy-token-admin',
          user: { id: 1, username: 'admin', name: 'Administrator', role: 'ADMIN', email: 'admin@unand.ac.id' }
        };
      }
      if (username === 'fasil') {
        return {
          token: 'dummy-token-fasil',
          user: { id: 2, username: 'fasil', name: 'Fasilitator Asrama', role: 'FASIL', email: 'fasil@unand.ac.id' }
        };
      }
      if (username === 'penghuni') {
        return {
          token: 'dummy-token-penghuni',
          user: { id: 3, username: 'penghuni', name: 'Budi Santoso', role: 'PENGHUNI', email: 'budi@student.unand.ac.id', noKamar: '101', blok: 'A' }
        };
      }
      
      // Jika password salah tapi dummy username, lempar error palsu
      if (['admin', 'fasil', 'penghuni'].includes(username)) {
         throw new Error("Password salah untuk akun dummy testing");
      }
    }

    // Jika bukan akun dummy, tetap coba tembak ke backend asli
    const response = await apiClient.post('/api/auth/login', { username, password });
    return response.data;
  },

  /**
   * Logout — clear local storage
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get stored token
   */
  getToken: () => localStorage.getItem('token'),

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => !!localStorage.getItem('token'),
};

export default authService;
