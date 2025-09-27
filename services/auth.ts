import api from './api';

export async function loginService(payload: { userName: string; password: string }) {
  const res = await api.post('/api/Auth/login', payload);
  return res.data;
}

export async function signupService(payload: { name: string; email: string; userName: string; password: string }) {
  const res = await api.post('/api/Auth/signup', payload);
  return res.data;
}
