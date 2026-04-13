import axios from 'axios';

const API = axios.create({ baseURL: `${process.env.REACT_APP_API_URL}/api` });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/updateprofile', data),
  updatePassword: (data) => API.put('/auth/updatepassword', data),
  forgotPassword: (email) => API.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => API.put(`/auth/resetpassword/${token}`, { password }),
};

export const jobsAPI = {
  getAll: (params) => API.get('/jobs', { params }),
  getOne: (id) => API.get(`/jobs/${id}`),
  create: (data) => API.post('/jobs', data),
  update: (id, data) => API.put(`/jobs/${id}`, data),
  delete: (id) => API.delete(`/jobs/${id}`),
  toggleFavorite: (id) => API.put(`/jobs/${id}/favorite`),
  getStats: () => API.get('/jobs/stats/summary'),
};

export const notesAPI = {
  getAll: (params) => API.get('/notes', { params }),
  create: (data) => API.post('/notes', data),
  update: (id, data) => API.put(`/notes/${id}`, data),
  delete: (id) => API.delete(`/notes/${id}`),
};

export const notificationsAPI = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

export const analyticsAPI = {
  get: () => API.get('/analytics'),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  changeRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getUserDetail: (id) => API.get(`/admin/users/${id}/detail`),
  getAllApplications: (params) => API.get('/admin/applications', { params }),
  getAnalytics: () => API.get('/admin/analytics'),
  bulkAction: (userIds, action) => API.post('/admin/users/bulk', { userIds, action }),
  exportUsers: () => API.get('/admin/export/users', { responseType: 'blob' }),
  exportApplications: () => API.get('/admin/export/applications', { responseType: 'blob' }),
};

export const uploadAPI = {
  uploadResume: (jobId, file) => {
    const fd = new FormData();
    fd.append('resume', file);
    return API.post(`/upload/resume/${jobId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default API;