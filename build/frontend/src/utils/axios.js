import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8050',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance; 