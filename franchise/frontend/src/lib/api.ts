import axios from 'axios';

// Environment variable to toggle mock/real API
// Mock data is no longer supported as per user request.

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    withCredentials: true,  // Enable sending cookies with requests
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Only attach token if we are NOT using mock (or if backend needs it)
        // For now, we assume backend needs token if we are talking to it.
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
