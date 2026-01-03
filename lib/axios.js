import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' }
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Global API Error:', error.response?.status);
        return Promise.reject(error);
    }
);

export default axiosInstance;