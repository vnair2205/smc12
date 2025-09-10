// admin-panel/src/services/teamService.js
import axios from 'axios';

const DEPT_URL = '/api/team/department';
const DESG_URL = '/api/team/designation';

const getAuthHeaders = () => ({ headers: { 'x-auth-token': localStorage.getItem('adminToken') } });

// Department Functions
export const getDepartments = () => axios.get(DEPT_URL, getAuthHeaders());
export const addDepartment = (name) => axios.post(DEPT_URL, { name }, getAuthHeaders());
export const updateDepartment = (id, name) => axios.put(`${DEPT_URL}/${id}`, { name }, getAuthHeaders());
export const deleteDepartment = (id) => axios.delete(`${DEPT_URL}/${id}`, getAuthHeaders());

// Designation Functions
export const getDesignations = () => axios.get(DESG_URL, getAuthHeaders());
export const addDesignation = (name) => axios.post(DESG_URL, { name }, getAuthHeaders());
export const updateDesignation = (id, name) => axios.put(`${DESG_URL}/${id}`, { name }, getAuthHeaders());
export const deleteDesignation = (id) => axios.delete(`${DESG_URL}/${id}`, getAuthHeaders());