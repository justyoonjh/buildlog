export interface Address {
  zipCode: string;
  address: string;
  detailAddress: string;
  [key: string]: any;
}

export interface BusinessInfo {
  b_no: string;
  c_nm?: string; // Company Name
  start_dt?: string; // Start Date
  b_stt?: string;
  b_stt_cd?: string;
  tax_type?: string;
  tax_type_cd?: string;
  end_dt?: string;
  utcc_yn?: string;
  tax_type_change_dt?: string;
  invoice_apply_dt?: string;
  rbf_tax_type?: string;
  rbf_tax_type_cd?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'boss' | 'employee';
  companyCode?: string;
  phone?: string;
  companyName?: string;
  businessNumber?: string;
  businessInfo?: BusinessInfo;
  address?: Address;
  createdAt?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface Schedule {
  id: number;
  time: string;
  title: string;
  type: 'work' | 'check' | 'material';
  date: string; // YYYY-MM-DD
}