export interface User {
  id: string;
  name: string;
  role: 'admin' | 'boss' | 'employee';
  companyCode?: string;
  phone?: string;
  companyName?: string;
  businessNumber?: string;
  businessInfo?: any;
  address?: any;
  createdAt?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}