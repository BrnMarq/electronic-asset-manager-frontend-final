import axios from "axios";

// Configure axios instance
const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("authToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("authToken");
			localStorage.removeItem("currentUser");
			window.location.href = "/";
		}
		return Promise.reject(error);
	}
);

export default api;
