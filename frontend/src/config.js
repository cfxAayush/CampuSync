export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const SERVER_BASE = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:8000'
);

export const getFullMediaUrl = (path) => {
  if (!path) return null;
  let url = String(path);
  if (url.includes('localhost:8000')) {
    url = url.replace(/https?:\/\/localhost:8000/g, SERVER_BASE);
  } else if (!url.startsWith('http')) {
    url = `${SERVER_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
};
