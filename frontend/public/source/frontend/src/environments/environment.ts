/**
 * URL da API C# (.NET 8).
 * - Local: http://localhost:5080
 * - Produção: defina a URL do serviço no Render/Railway em PRODUCTION_API_URL.
 */
const PRODUCTION_API_URL = 'https://target-desafio-api.onrender.com';

const isLocal =
  typeof location !== 'undefined' && ['localhost', '127.0.0.1'].includes(location.hostname);

export const environment = {
  apiUrl: isLocal ? 'http://localhost:5080' : PRODUCTION_API_URL
};
