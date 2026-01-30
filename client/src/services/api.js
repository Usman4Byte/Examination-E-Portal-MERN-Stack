import axios from "axios";

// Use environment variable, or detect production URL
const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // In production (Vercel), use your deployed backend URL
    if (import.meta.env.PROD) {
        return "https://examination-e-portal-usman-backend.vercel.app/"; // <-- Replace with your actual backend URL
    }
    // Local development
    return "http://localhost:5000/api";
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json"
    }
});

/* REQUEST INTERCEPTOR
   Automatically attach JWT token */
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* RESPONSE INTERCEPTOR (OPTIONAL BUT GOOD) */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
