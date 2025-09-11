// admin-panel/src/services/supportService.js
import axios from 'axios';

const API_URL = '/api/support/category';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { headers: { 'x-auth-token': token } };
};

export const getCategories = () => axios.get(API_URL, getAuthHeaders());
export const addCategory = (name) => axios.post(API_URL, { name }, getAuthHeaders());
export const updateCategory = (id, name) => axios.put(`${API_URL}/${id}`, { name }, getAuthHeaders());
export const deleteCategory = (id) => axios.delete(`${API_URL}/${id}`, getAuthHeaders());