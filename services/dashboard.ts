import api from './api';

export async function getDashBoard(){
  const r = await api.get('/api/Dashboard/GetDashboardStats');
  return r.data;
}
