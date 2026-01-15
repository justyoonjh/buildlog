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

export interface ConstructionStage {
  id: string;
  name: string;
  manager: string;
  duration: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export type Tab = 'consultation' | 'estimate' | 'contract' | 'construction' | 'completed';

export interface EstimateItem {
  id?: number;
  category: string;
  description: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface Estimate {
  id: string;
  userId?: string;
  clientName: string;
  clientPhone: string;
  siteAddress: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: string; // 'consultation' | 'negotiating' | 'contract_ready' | 'contracted' | 'construction' | 'completed'
  totalAmount: number;
  vatIncluded: number; // 1 or 0
  memo?: string;
  items?: EstimateItem[];
  modelImage?: string;
  generatedImage?: string;
  styleDescription?: string;
  downPayment?: number;
  progressPayment?: number;
  balancePayment?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  estimates?: T; // Flexible for list responses
  estimate?: T;  // Flexible for single item responses
  [key: string]: any;
}

export interface EstimatesResponse extends ApiResponse {
  estimates: Estimate[];
}

export interface EstimateDetailResponse extends ApiResponse {
  estimate: Estimate;
}