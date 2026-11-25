import axios from "axios";

// Session lives in memory only: a page refresh or logout clears it.
// (Issued tokens still expire after 1 hour; they are not revoked server-side.)
let session = { token: null, user: null };

const api = axios.create({ baseURL: "http://localhost:5000/api" });

api.interceptors.request.use((config) => {
  if (session.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith("/auth/");
    if (err.response?.status === 401 && !isAuthCall) {
      logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function saveSession({ token, user }) {
  session = { token, user };
}

export function logout() {
  session = { token: null, user: null };
}

export function isLoggedIn() {
  return Boolean(session.token);
}

export function getUser() {
  return session.user;
}

export function errorMessage(err) {
  return err.response?.data?.message || err.response?.data?.error || "Something went wrong. Try again.";
}

export default api;
