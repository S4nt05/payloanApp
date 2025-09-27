// src/services/payments.ts
import api from './api';
import { CreatePaymentRequestDto, PaymentDto } from '@/types/api';

export async function getPayments() {
  const r = await api.get('/api/Payments/GetPayments');
  return r.data as PaymentDto[];
}

export async function getPaymentById(id: number) {
  const r = await api.get(`/api/Payments/GetPaymentById/${id}`);
  return r.data as PaymentDto;
}

export async function getPaymentsByLoan(loanId: number) {
  // Swagger: /api/Payments/GetPaymentsByLoan/{loanId}
  const r = await api.get(`/api/Payments/GetPaymentsByLoan/${loanId}`);
  return r.data as PaymentDto[];
}

export async function createPayment(payload: CreatePaymentRequestDto) {
  const r = await api.post('/api/Payments/CreatePayment', payload);
  return r.data;
}

// Nota: el endpoint PUT /api/Payments/UpdatePayment/{paymentId} no aparece en el swagger
// Si existe en tu backend, descomenta y ajusta la ruta:
// export async function updatePayment(paymentId:number, payload:Partial<CreatePaymentRequestDto>){
//   const r = await api.put(`/api/Payments/UpdatePayment/${paymentId}`, payload);
//   return r.data;
// }
