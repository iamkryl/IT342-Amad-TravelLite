import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => API.post('/auth/register', data);

export const loginUser = (data: {
  email: string;
  password: string;
}) => API.post('/auth/login', data);

export const getProfile = () => API.get('/users/me');

export const updateProfile = (data: {
  firstName?: string;
  lastName?: string;
  password?: string;
}) => API.put('/users/me', data);

export const uploadPhoto = (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  return API.post('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export default API;