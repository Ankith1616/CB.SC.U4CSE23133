import axios from 'axios';

const API_URL = '/evaluation-service/notifications';
const rawToken = import.meta.env.VITE_API_TOKEN || '';
const TOKEN = rawToken.replace(/^["']|["']$/g, '');

export const fetchNotifications = async (page = 1, limit = 10, type = '') => {
  const params = { page, limit };
  if (type && type !== 'All') params.notification_type = type;

  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    params
  });
  
  // Handle case where API returns a plain array vs an object with "notifications"
  return Array.isArray(response.data) ? response.data : (response.data.notifications || []);
};

export const fetchAllNotifications = async () => {
  const allData = [];
  
  // Fetch sequentially to avoid rate-limiting or concurrent request blocking from the Evaluation Service
  for (let p = 1; p <= 5; p++) {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        params: { page: p, limit: 10 }
      });
      const data = Array.isArray(response.data) ? response.data : (response.data.notifications || []);
      allData.push(...data);
    } catch (err) {
      // Stop fetching if we hit an error (e.g., token expired, 429, or out of pages)
      console.error(`Failed to fetch page ${p}:`, err.message);
      break; 
    }
  }

  return allData;
};
