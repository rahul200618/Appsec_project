import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API = "http://localhost:5000";

const common = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

// Production build (npm run serve / npm run preview): strict policy, no inline scripts or styles.
const previewHeaders = {
  ...common,
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    `connect-src 'self' ${API}`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; "),
};

// Dev server only: hot reload needs inline scripts/styles and a websocket. Do NOT scan this one.
const devHeaders = {
  ...common,
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    `connect-src 'self' ${API} ws://localhost:5173`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; "),
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { sourcemap: false },
  server: { host: "localhost", port: 5173, cors: false, headers: devHeaders },
  preview: { host: "localhost", port: 5173, cors: false, headers: previewHeaders },
});
