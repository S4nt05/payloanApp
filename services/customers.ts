import api from './api';
import { CustomerDto } from '@/types/api';

export async function fetchCustomers({ page = 1, q = '' }:{page?:number;q?:string}){
  const r = await api.get('/api/Customers/GetCustomer', { params: { page, q } });
  return r.data; 
}

// export async function createCustomer(payload: CustomerDto) {
//   const processId = 2;
//   console.log('Creando cliente:', payload);
//   const r = await api.post(`/api/Customers/CreateOrEditCustomer/${processId}`, payload);
//   console.log('Respuesta:', r);
//   return r.data;
// }

export async function createCustomer(payload: CustomerDto) {
  const processId = 2;
  const formData = new FormData();

  formData.append('Id', '0');
  formData.append('FirstName', payload.firstName);
  formData.append('SecondName', payload.secondName ?? '');
  formData.append('FirstLastname', payload.firstLastname);
  formData.append('SecondLastname', payload.secondLastname ?? '');
  formData.append('Identification', payload.identification ?? '');
  formData.append('PersonalAddress', payload.personalAddress ?? '');
  formData.append('WorkAddress', payload.workAddress ?? '');
  formData.append('PersonalPhone', payload.personalPhone ?? '');
  formData.append('WorkPhone', payload.workPhone ?? '');
  formData.append('Email', payload.email ?? '');
  formData.append('Workplace', payload.workplace ?? '');
  formData.append('UserCreated', 'admin');
  formData.append('DateCreated', new Date().toISOString());
  formData.append('UserChange', 'admin');
  formData.append('DateChange', new Date().toISOString());
  formData.append('CountryId', '1');
  formData.append('State', 'true');
  formData.append('Status', 'Activo');
  formData.append('Document.DocumentId', '1');
  formData.append('Document.DocumentTypeId', '1');
  formData.append('Document.Name', '');
  formData.append('Document.Identification', '');
  formData.append('Document.UrlSecure', '');
  // Si no tienes archivo, omite Document.File
  formData.append('Reference', JSON.stringify(payload.references ?? []));

  console.log('Creando cliente:', formData);

  const r = await api.post(
    `/api/Customers/CreateOrEditCustomer/${processId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  console.log('Respuesta:', r);
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