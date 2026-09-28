// API helper service for client-side HTTP requests
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => localStorage.getItem('token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const fetchApi = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login?expired=true';
        }
      }
      throw new Error(data.message || 'An error occurred while processing your request.');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// API Services
export const api = {
  // Auth
  login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getCurrentUser: () => fetchApi('/auth/me'),
  changePassword: (data) => fetchApi('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Stats
  getAdminStats: () => fetchApi('/stats/admin'),
  getDoctorStats: () => fetchApi('/stats/doctor'),
  getPatientStats: () => fetchApi('/stats/patient'),

  // Patients
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/patients?${query}`);
  },
  getPatientById: (id) => fetchApi(`/patients/${id}`),
  quickSearchPatients: (query) => fetchApi(`/patients/quick-search?query=${encodeURIComponent(query)}`),
  createPatient: (data) => fetchApi('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id, data) => fetchApi(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id) => fetchApi(`/patients/${id}`, { method: 'DELETE' }),

  // Case History
  getCaseHistory: (patientId) => fetchApi(`/case-history/${patientId}`),
  createCaseHistory: (data) => fetchApi('/case-history', { method: 'POST', body: JSON.stringify(data) }),
  updateCaseHistory: (id, data) => fetchApi(`/case-history/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Medical History
  getMedicalHistory: (patientId) => fetchApi(`/medical-history/${patientId}`),
  createMedicalHistory: (data) => fetchApi('/medical-history', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicalHistory: (id, data) => fetchApi(`/medical-history/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMedicalHistory: (id) => fetchApi(`/medical-history/${id}`, { method: 'DELETE' }),

  // Allergies
  getAllergies: (patientId) => fetchApi(`/allergies/${patientId}`),
  createAllergy: (data) => fetchApi('/allergies', { method: 'POST', body: JSON.stringify(data) }),
  updateAllergy: (id, data) => fetchApi(`/allergies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAllergy: (id) => fetchApi(`/allergies/${id}`, { method: 'DELETE' }),

  // Medications
  getMedications: (patientId) => fetchApi(`/medications/${patientId}`),
  createMedication: (data) => fetchApi('/medications', { method: 'POST', body: JSON.stringify(data) }),
  updateMedication: (id, data) => fetchApi(`/medications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMedication: (id) => fetchApi(`/medications/${id}`, { method: 'DELETE' }),

  // Consultations
  getConsultations: (patientId) => fetchApi(`/consultations/${patientId}`),
  createConsultation: (data) => fetchApi('/consultations', { method: 'POST', body: JSON.stringify(data) }),

  // Follow-ups
  getFollowUps: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/follow-ups?${query}`);
  },
  createFollowUp: (data) => fetchApi('/follow-ups', { method: 'POST', body: JSON.stringify(data) }),
  updateFollowUp: (id, data) => fetchApi(`/follow-ups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFollowUp: (id) => fetchApi(`/follow-ups/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/users?${query}`);
  },
  createUser: (data) => fetchApi('/users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id) => fetchApi(`/users/${id}`, { method: 'DELETE' }),
};
