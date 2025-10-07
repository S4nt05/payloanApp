import api from './api';
import { CatalogItem } from '@/types/api';

export async function getCountries(): Promise<CatalogItem[]> {
  const r = await api.get('/api/Catalogs/GetCountrys');
  return r.data.data;
}

export async function getDocumentTypes(): Promise<CatalogItem[]> {
  const r = await api.get('/api/Catalogs/GetDocumentTypes');
  return r.data.data;
}