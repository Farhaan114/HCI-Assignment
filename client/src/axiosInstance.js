import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

export default axiosInstance;
