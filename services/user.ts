import api from './api';

export async function getProfile(){
  const r = await api.get('/api/User/Profile');
  return r.data;
}

export async function updateProfile(payload:any){
  const r = await api.put('/api/User/UpdateProfile', payload);
  return r.data;
}

export async function uploadPhotoPlaceholder(base64:string){
  // placeholder para integracion con presigned urls
  return { url: 'https://cdn.example.com/photo.jpg' };
}