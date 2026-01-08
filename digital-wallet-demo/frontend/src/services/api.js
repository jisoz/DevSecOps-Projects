import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.56.241', // Kong API Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;