// services/loans.ts
import api from './api';
import { LoanCreateDto, LoanDto, IncreaseCreditRequestDto, SimulateLoanRequestDto } from '@/types/api';

export async function createLoan(payload: LoanCreateDto) {
  const r = await api.post('/api/Loans/CreateLoan', payload);
  return r.data;
}

export async function updateLoan(id: number, payload: Partial<LoanCreateDto>) {
  const r = await api.put(`/api/Loans/UpdateLoan/${id}`, payload);
  return r.data;
}

export async function getLoanById(id: number) {
  const r = await api.get(`/api/Loans/GetLoanDetail/${id}`);
  return r.data as LoanDto;
}

export async function getLoans() {
  const r = await api.get('/api/Loans/GetLoans');
  return r.data;
}

export async function generateDelinquencyData() {
  const r = await api.post('/api/Loans/GenerateDelinquencyData');
  return r.data;
}

export async function createIncreaseCredit(payload: IncreaseCreditRequestDto) {
  const r = await api.post('/api/Loans/CreateIncreaseCredit', payload);
  return r.data;
}

export async function getReceiptIncreaseCreditById(id: number) {
  const r = await api.get(`/api/Loans/ReceiptIncreaseCreditById/${id}`);
  return r.data;
}

export async function getLoanBalanceById(loanId: number) {
  const r = await api.get(`/api/Loans/LoanBalanceById/${loanId}`);
  return r.data;
}

export async function simulateLoan(payload: SimulateLoanRequestDto) {
  const r = await api.post('/api/Loans/SimulateLoan', payload);
  return r.data;
}
