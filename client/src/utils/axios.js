import axios from 'axios';

// API URL'sini kontrol et
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL);

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 saniye timeout
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Sunucu yanıtı ile dönen hatalar
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        window.location.href = '/dashboard';
      } else if (error.response.status === 404) {
        console.error('Resource not found:', error.config.url);
      } else if (error.response.status >= 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('No response received:', error.request);
    } else {
      // İstek oluşturulurken bir hata oluştu
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default instance; 