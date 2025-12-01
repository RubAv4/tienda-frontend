// src/app/config/api.config.ts

// Si estás en localhost -> usa tu backend local
// Si estás en Vercel u otro dominio -> usa el backend de Render
const isLocalhost = window.location.hostname === 'localhost';

export const API_BASE_URL = isLocalhost
  ? 'http://localhost:8080/api'
  : 'https://tienda-backend-1jiw.onrender.com/api';
