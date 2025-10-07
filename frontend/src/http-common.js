import axios from "axios";

const environment = process.env.NODE_ENV;

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const resolveBaseUrl = () => {
  const configured = process.env.API_BASE_URL && process.env.API_BASE_URL.trim();
  if (configured) return trimTrailingSlash(configured);

  if (environment === 'development') {
    return 'http://localhost:8081/api';
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${trimTrailingSlash(window.location.origin)}/api`;
  }

  return '/api';
};

export default axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-type": "application/json"
  }
});
