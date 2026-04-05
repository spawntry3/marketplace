import axios from 'axios';

function resolveBaseURL(): string {
  if (typeof window !== 'undefined') {
    const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (fromEnv) return fromEnv;
    return '/api';
  }
  return process.env.INTERNAL_API_URL ?? 'http://localhost:3001/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
