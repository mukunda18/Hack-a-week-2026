import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

export default axiosInstance;