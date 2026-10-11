import axios from 'axios';

// Event target for broadcasting cold-start waking status to UI
export const serverWakeEvent = new EventTarget();

export function onServerWakeChange(callback) {
  const handler = (e) => callback(e.detail);
  serverWakeEvent.addEventListener('wake-status', handler);
  return () => serverWakeEvent.removeEventListener('wake-status', handler);
}

function notifyWakeStatus(isWaking, attempt = 0) {
  serverWakeEvent.dispatchEvent(
    new CustomEvent('wake-status', { detail: { isWaking, attempt } })
  );
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000, // 60s timeout for Render free tier cold-start resilience
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: logout on 401, retry GET up to 3 times on 502/503/504 or network timeout
client.interceptors.response.use(
  (response) => {
    notifyWakeStatus(false);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized: clear storage and signal logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    }

    // Check if error is cold-start transient (502, 503, 504 or network/timeout)
    const isTransientError =
      !error.response ||
      [502, 503, 504].includes(error.response?.status) ||
      error.code === 'ECONNABORTED';

    const isGetRequest = originalRequest && originalRequest.method?.toLowerCase() === 'get';

    if (isTransientError && isGetRequest) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;
        notifyWakeStatus(true, originalRequest._retryCount);

        // Wait 5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return client(originalRequest);
      }
    }

    notifyWakeStatus(false);
    return Promise.reject(error);
  }
);

export default client;
