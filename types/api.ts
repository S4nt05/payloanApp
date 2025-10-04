// src/types/api.ts
export interface Country {
  id?: number;
  name?: string | null;
  state?: boolean;
  userCreated?: string | null;
  dateCreated?: string | null;
  userChange?: string | null;
  dateChange?: string | null;
}

export interface CreatePaymentRequestDto {
  paymentId?: number;
  userCreated?: string | null;
  dateCreated?: string; // ISO string
  loanId?: number;
  currencyNumber?: number;
  amount?: number;
  paymentMethodId?: number;
  comentary?: string | null;
  isPartialPayment?: number;
}

export interface IncreaseCreditRequestDto {
  managementId?: number;
  userCreated?: string | null;
  dateCreated?: string | null;
  userChange?: string | null;
  dateChange?: string | null;
  description?: string | null;
  loanId?: number;
  customerId?: number;
  refinanceAmount?: number;
  refinanceDate?: string | null;
}

export interface LoanCreateDto {
  loanId?: number;
  userCreated?: string | null;
  dateCreated?: string | null;
  userChange?: string | null;
  dateChange?: string | null;
  customerId?: number;
  paymentFrequencyId?: number;
  loanAmount?: number;
  interestRate?: number;
  currencyNumber?: number;
  disbursementDate?: string | null;
  firstDayPay?: string | null;
  loanStatus?: boolean | null;
  comment?: string | null;
  calculationTypeLoanId?: number;
  term?: number;
}

export interface LoginUserRequestDto {
  userName: string;
  password: string;
  rememberMe?: boolean;
}

export interface ReferenceDto {
  id?: number | null;
  firstName?: string | null;
  secondName?: string | null;
  firstLastname?: string | null;
  secondLastname?: string | null;
  identification?: string | null;
  personalAddress?: string | null;
  workAddress?: string | null;
  personalPhone?: string | null;
  workPhone?: string | null;
  email?: string | null;
  workplace?: string | null;
}

export interface SignupUserRequestDto {
  name: string;
  email: string;
  password: string;
  userName: string;
  userCreated: string;
}

export interface SimulateLoanRequestDto {
  loanAmount?: number;
  term?: number;
  interestRate?: number;
  startDate: string; // required in swagger
}

export interface SupabaseTokenRequestDto {
  supabaseToken: string;
}

/* Tipos auxiliares (útiles en la app) */

export interface UserDto {
  userId?: number;
  name: string;
  email: string;
  userName: string;
  phone?: string;
  photoUrl?: string;
  role?: 'admin'|'agent'|'viewer';
}

export interface DocumentDto {
  documentId?: number;
  name?: string;
  identification?: string;
  documentTypeId?: number;
  urlSecure?: string;
}

export interface CustomerDto {
  id?: number;
  firstName: string;
  secondName?: string;
  firstLastname: string;
  secondLastname?: string;
  identification?: string;
  personalAddress?: string;
  workAddress?: string;
  personalPhone?: string;
  workPhone?: string;
  email?: string;
  workplace?: string;
  state?: 'Activo'|'Inactivo';
  createdBy?: string;
  dateCreated?: string;
  references?: ReferenceDto[];
  document?: DocumentDto; 
}

export interface PaymentDto {
  loanId: number;
  paymentId: number;
  receiptNumber: string;
  paymentDate: string;
  customerName: string;
  currency: string;
  amount: number;
  amountPaid?: string;
  paymentMethod: string;
  previousBalance: number;
  principalPayment: number;
  interestPayment: number;
  newPrincipalBalance: number;
}

export interface LoanDto extends LoanCreateDto {
  // Extiende LoanCreateDto con campos de lectura si aplican
  loanId?: number;
  customerName?: string;
  outstandingBalance?: number;
  payments?: PaymentDto[];
}

export interface CatalogItem {
  id: number;
  name: string;
  description?: string;
}
