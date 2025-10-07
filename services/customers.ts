import api from './api';
import { CustomerDto } from '@/types/api';

export async function fetchCustomers({ page = 1, q = '' }:{page?:number;q?:string}){
  const r = await api.get('/api/Customers/GetCustomer', { params: { page, q } });
  return r.data; 
}

export async function createCustomer(payload: CustomerDto) {
  const processId = 2;
  const formData = new FormData();

  formData.append('Id', payload.id?.toString() ?? '0');
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
  formData.append('UserCreated', payload.createdBy ?? 'admin');
  formData.append('DateCreated', payload.dateCreated ?? new Date().toISOString());
  formData.append('UserChange', payload.createdBy ?? 'admin');
  formData.append('DateChange', payload.dateCreated ?? new Date().toISOString());
  formData.append('CountryId', payload.countryId?.toString() ?? '1');
  formData.append('State', payload.state === 'Activo' ? 'true' : 'false');
  formData.append('Status', payload.state ?? 'Activo');

  // Document
  formData.append('Document.DocumentId', payload.document?.documentId?.toString() ?? '0');
  formData.append('Document.DocumentTypeId', payload.document?.documentTypeId?.toString() ?? '');
  formData.append('Document.Name', payload.document?.name ?? '');
  formData.append('Document.Identification', payload.document?.identification ?? '');
  formData.append('Document.UrlSecure', payload.document?.urlSecure ?? '');

  // Adjuntar archivo si existe
  if (payload.document?.file) {
    formData.append('Document.File', {
      uri: payload.document.file.uri,
      name: payload.document.file.name,
      type: payload.document.file.type,
    });
  }

 if (payload.references && payload.references.length > 0) {
  payload.references.forEach((ref, idx) => {
    if (ref.firstName) formData.append(`Reference[${idx}].FirstName`, ref.firstName);
    if (ref.secondName) formData.append(`Reference[${idx}].SecondName`, ref.secondName);
    if (ref.firstLastname) formData.append(`Reference[${idx}].FirstLastname`, ref.firstLastname);
    if (ref.secondLastname) formData.append(`Reference[${idx}].SecondLastname`, ref.secondLastname);
    if (ref.identification) formData.append(`Reference[${idx}].Identification`, ref.identification);
    if (ref.personalAddress) formData.append(`Reference[${idx}].PersonalAddress`, ref.personalAddress);
    if (ref.workAddress) formData.append(`Reference[${idx}].WorkAddress`, ref.workAddress);
    if (ref.personalPhone) formData.append(`Reference[${idx}].PersonalPhone`, ref.personalPhone);
    if (ref.workPhone) formData.append(`Reference[${idx}].WorkPhone`, ref.workPhone);
    if (ref.email) formData.append(`Reference[${idx}].Email`, ref.email);
    if (ref.workplace) formData.append(`Reference[${idx}].Workplace`, ref.workplace);
    if (ref.id !== undefined && ref.id !== null) formData.append(`Reference[${idx}].Id`, ref.id.toString());
  });
}

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