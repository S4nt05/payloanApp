import api from './api';
import { CustomerDto } from '@/types/api';

export async function fetchCustomers({ page = 1, q = '' }:{page?:number;q?:string}){
  const r = await api.get('/api/Customers/GetCustomer', { params: { page, q } });
  return r.data; 
}

export async function createCustomer(payload:CustomerDto){
  const r = await api.post('/api/Customers/CreateOrEditCustomer', payload);
  return r.data;
}

export async function updateCustomer(id:number, payload:Partial<CustomerDto>){
  const r = await api.put(`/api/Customers/CreateOrEditCustomer/${id}`, payload);
  return r.data;
}

export async function getCustomerById(id:number){
  const r = await api.get(`/api/Customers/GetCustomerById/${id}`);
  return r.data;
}