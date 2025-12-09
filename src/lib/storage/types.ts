// Core data types shared between storage backends

export interface Company {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  name: string;
  employee_code: string | null;
  phone: string | null;
  image_url: string | null;
  default_meal_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string | null;
  default_price: number;
  is_active: boolean;
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
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyPayment {
  id: string;
  company_id: string;
  payment_date: string;
  amount: number;
  method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeePayment {
  id: string;
  employee_id: string;
  company_id: string;
  payment_date: string;
  amount: number;
  method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceOverride {
  id: string;
  food_item_id: string;
  company_id: string | null;
  employee_id: string | null;
  price: number;
  priority: number;
  created_at: string;
  updated_at: string;
}
