// client/src/services/supportService.js
import axios from 'axios';

const API_URL = '/api/public/support';
const CATEGORY_API_URL = '/api/public/support/categories';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { 'x-auth-token': token } };
};

export const getCategories = () => axios.get(CATEGORY_API_URL, getAuthHeaders());
export const getUserTickets = (params) => axios.get(API_URL, { ...getAuthHeaders(), params });

export const createTicket = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(API_URL, formData, {
    headers: {
      'x-auth-token': token,
      'Content-Type': 'multipart/form-data'
    }
  });
};