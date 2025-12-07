export type UserRole = 'admin' | 'manager' | 'cashier' | 'viewer';
export type EmployeeStatus = 'active' | 'inactive';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  code?: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  billing_cycle: string;
  billing_day?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  name: string;
  employee_code?: string;
  phone?: string;
  image_url?: string;
  default_meal_price: number;
  status: EmployeeStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface FoodItem {
  id: string;
  name: string;
  category?: string;
  default_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceOverride {
  id: string;
  company_id?: string;
  employee_id?: string;
  food_item_id: string;
  price: number;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface FoodTransaction {
  id: string;
  date: string;
  company_id: string;
  employee_id: string;
  food_item_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
  employee?: Employee;
  food_item?: FoodItem;
}

export interface CompanyPayment {
  id: string;
  company_id: string;
  payment_date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface CompanyStatement {
  company: Company;
  from_date: string;
  to_date: string;
  opening_balance: number;
  period_charges: number;
  payments_received: number;
  closing_balance: number;
  transactions: FoodTransaction[];
  payments: CompanyPayment[];
}

export interface DashboardStats {
  total_companies: number;
  active_companies: number;
  total_employees: number;
  today_meals: number;
  today_amount: number;
  month_amount: number;
  top_outstanding: Array<{
    company: Company;
    outstanding: number;
  }>;
}
