// LocalStorage implementation for offline/self-hosted mode

import type {
  Company,
  Employee,
  FoodItem,
  FoodTransaction,
  CompanyPayment,
  EmployeePayment,
  PriceOverride,
} from "./types";

const STORAGE_KEYS = {
  companies: "foodtrack_companies",
  employees: "foodtrack_employees",
  foodItems: "foodtrack_food_items",
  transactions: "foodtrack_transactions",
  companyPayments: "foodtrack_company_payments",
  employeePayments: "foodtrack_employee_payments",
  priceOverrides: "foodtrack_price_overrides",
};

// Helper functions
function generateId(): string {
  return crypto.randomUUID();
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Companies
export const localCompanies = {
  getAll: (): Company[] => {
    return getFromStorage<Company>(STORAGE_KEYS.companies).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },

  getById: (id: string): Company | null => {
    const companies = getFromStorage<Company>(STORAGE_KEYS.companies);
    return companies.find((c) => c.id === id) || null;
  },

  create: (company: Omit<Company, "id" | "created_at" | "updated_at">): Company => {
    const companies = getFromStorage<Company>(STORAGE_KEYS.companies);
    const newCompany: Company = {
      ...company,
      id: generateId(),
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };
    companies.push(newCompany);
    setToStorage(STORAGE_KEYS.companies, companies);
    return newCompany;
  },

  update: (id: string, updates: Partial<Company>): Company | null => {
    const companies = getFromStorage<Company>(STORAGE_KEYS.companies);
    const index = companies.findIndex((c) => c.id === id);
    if (index === -1) return null;

    companies[index] = {
      ...companies[index],
      ...updates,
      updated_at: getTimestamp(),
    };
    setToStorage(STORAGE_KEYS.companies, companies);
    return companies[index];
  },

  delete: (id: string): boolean => {
    const companies = getFromStorage<Company>(STORAGE_KEYS.companies);
    const filtered = companies.filter((c) => c.id !== id);
    if (filtered.length === companies.length) return false;
    setToStorage(STORAGE_KEYS.companies, filtered);
    return true;
  },
};

// Employees
export const localEmployees = {
  getAll: (companyId?: string): Employee[] => {
    let employees = getFromStorage<Employee>(STORAGE_KEYS.employees);
    if (companyId && companyId !== "all") {
      employees = employees.filter((e) => e.company_id === companyId);
    }
    return employees.sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: (id: string): Employee | null => {
    const employees = getFromStorage<Employee>(STORAGE_KEYS.employees);
    return employees.find((e) => e.id === id) || null;
  },

  create: (employee: Omit<Employee, "id" | "created_at" | "updated_at">): Employee => {
    const employees = getFromStorage<Employee>(STORAGE_KEYS.employees);
    const newEmployee: Employee = {
      ...employee,
      id: generateId(),
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };
    employees.push(newEmployee);
    setToStorage(STORAGE_KEYS.employees, employees);
    return newEmployee;
  },

  update: (id: string, updates: Partial<Employee>): Employee | null => {
    const employees = getFromStorage<Employee>(STORAGE_KEYS.employees);
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) return null;

    employees[index] = {
      ...employees[index],
      ...updates,
      updated_at: getTimestamp(),
    };
    setToStorage(STORAGE_KEYS.employees, employees);
    return employees[index];
  },

  delete: (id: string): boolean => {
    const employees = getFromStorage<Employee>(STORAGE_KEYS.employees);
    const filtered = employees.filter((e) => e.id !== id);
    if (filtered.length === employees.length) return false;
    setToStorage(STORAGE_KEYS.employees, filtered);
    return true;
  },
};

// Food Items
export const localFoodItems = {
  getAll: (activeOnly = false): FoodItem[] => {
    let items = getFromStorage<FoodItem>(STORAGE_KEYS.foodItems);
    if (activeOnly) {
      items = items.filter((i) => i.is_active);
    }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: (id: string): FoodItem | null => {
    const items = getFromStorage<FoodItem>(STORAGE_KEYS.foodItems);
    return items.find((i) => i.id === id) || null;
  },

  create: (item: Omit<FoodItem, "id" | "created_at" | "updated_at">): FoodItem => {
    const items = getFromStorage<FoodItem>(STORAGE_KEYS.foodItems);
    const newItem: FoodItem = {
      ...item,
      id: generateId(),
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };
    items.push(newItem);
    setToStorage(STORAGE_KEYS.foodItems, items);
    return newItem;
  },

  update: (id: string, updates: Partial<FoodItem>): FoodItem | null => {
    const items = getFromStorage<FoodItem>(STORAGE_KEYS.foodItems);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updated_at: getTimestamp(),
    };
    setToStorage(STORAGE_KEYS.foodItems, items);
    return items[index];
  },

  delete: (id: string): boolean => {
    const items = getFromStorage<FoodItem>(STORAGE_KEYS.foodItems);
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    setToStorage(STORAGE_KEYS.foodItems, filtered);
    return true;
  },
};

// Food Transactions
export const localTransactions = {
  getAll: (employeeId?: string, companyId?: string): FoodTransaction[] => {
    let transactions = getFromStorage<FoodTransaction>(STORAGE_KEYS.transactions);
    if (employeeId) {
      transactions = transactions.filter((t) => t.employee_id === employeeId);
    }
    if (companyId) {
      transactions = transactions.filter((t) => t.company_id === companyId);
    }
    return transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  create: (
    txns: Omit<FoodTransaction, "id" | "created_at" | "updated_at">[]
  ): FoodTransaction[] => {
    const transactions = getFromStorage<FoodTransaction>(STORAGE_KEYS.transactions);
    const newTxns = txns.map((t) => ({
      ...t,
      id: generateId(),
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    }));
    transactions.push(...newTxns);
    setToStorage(STORAGE_KEYS.transactions, transactions);
    return newTxns;
  },

  delete: (id: string): boolean => {
    const transactions = getFromStorage<FoodTransaction>(STORAGE_KEYS.transactions);
    const filtered = transactions.filter((t) => t.id !== id);
    if (filtered.length === transactions.length) return false;
    setToStorage(STORAGE_KEYS.transactions, filtered);
    return true;
  },
};

// Company Payments
export const localCompanyPayments = {
  getAll: (companyId?: string): CompanyPayment[] => {
    let payments = getFromStorage<CompanyPayment>(STORAGE_KEYS.companyPayments);
    if (companyId) {
      payments = payments.filter((p) => p.company_id === companyId);
    }
    return payments.sort(
      (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
  },

  create: (
    payment: Omit<CompanyPayment, "id" | "created_at" | "updated_at">
  ): CompanyPayment => {
    const payments = getFromStorage<CompanyPayment>(STORAGE_KEYS.companyPayments);
    const newPayment: CompanyPayment = {
      ...payment,
      id: generateId(),
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };
    payments.push(newPayment);
    setToStorage(STORAGE_KEYS.companyPayments, payments);
    return newPayment;
  },

  delete: (id: string): boolean => {
    const payments = getFromStorage<CompanyPayment>(STORAGE_KEYS.companyPayments);
    const filtered = payments.filter((p) => p.id !== id);
    if (filtered.length === payments.length) return false;
    setToStorage(STORAGE_KEYS.companyPayments, filtered);
    return true;
  },
};

// Employee Payments
export const localEmployeePayments = {
  getAll: (employeeId?: string, companyId?: string): EmployeePayment[] => {
    let payments = getFromStorage<EmployeePayment>(STORAGE_KEYS.employeePayments);
    if (employeeId) {
      payments = payments.filter((p) => p.employee_id === employeeId);
    }
    if (companyId) {
      payments = payments.filter((p) => p.company_id === companyId);
    }
    return payments.sort(
      (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
  },

  create: (
    payment: Omit<EmployeePayment, "id" | "created_at" | "updated_at">
  ): EmployeePayment => {
    const payments = getFromStorage<EmployeePayment>(STORAGE_KEYS.employeePayments);
    const newPayment: EmployeePayment = {
      ...payment,
      id: generateId(),
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };
    payments.push(newPayment);
    setToStorage(STORAGE_KEYS.employeePayments, payments);
    return newPayment;
  },

  delete: (id: string): boolean => {
    const payments = getFromStorage<EmployeePayment>(STORAGE_KEYS.employeePayments);
    const filtered = payments.filter((p) => p.id !== id);
    if (filtered.length === payments.length) return false;
    setToStorage(STORAGE_KEYS.employeePayments, filtered);
    return true;
  },
};

// Price Overrides
export const localPriceOverrides = {
  getAll: (foodItemId?: string, companyId?: string, employeeId?: string): PriceOverride[] => {
    let overrides = getFromStorage<PriceOverride>(STORAGE_KEYS.priceOverrides);
    if (foodItemId) {
      overrides = overrides.filter((o) => o.food_item_id === foodItemId);
    }
    if (companyId) {
      overrides = overrides.filter((o) => o.company_id === companyId);
    }
    if (employeeId) {
      overrides = overrides.filter((o) => o.employee_id === employeeId);
    }
    return overrides.sort((a, b) => b.priority - a.priority);
  },

  create: (
    override: Omit<PriceOverride, "id" | "created_at" | "updated_at">
  ): PriceOverride => {
    const overrides = getFromStorage<PriceOverride>(STORAGE_KEYS.priceOverrides);
    const newOverride: PriceOverride = {
      ...override,
      id: generateId(),
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
    };
    overrides.push(newOverride);
    setToStorage(STORAGE_KEYS.priceOverrides, overrides);
    return newOverride;
  },

  delete: (id: string): boolean => {
    const overrides = getFromStorage<PriceOverride>(STORAGE_KEYS.priceOverrides);
    const filtered = overrides.filter((o) => o.id !== id);
    if (filtered.length === overrides.length) return false;
    setToStorage(STORAGE_KEYS.priceOverrides, filtered);
    return true;
  },
};

// Export/Import functionality for data backup
export const localStorageBackup = {
  exportAll: (): string => {
    const data = {
      companies: getFromStorage(STORAGE_KEYS.companies),
      employees: getFromStorage(STORAGE_KEYS.employees),
      foodItems: getFromStorage(STORAGE_KEYS.foodItems),
      transactions: getFromStorage(STORAGE_KEYS.transactions),
      companyPayments: getFromStorage(STORAGE_KEYS.companyPayments),
      employeePayments: getFromStorage(STORAGE_KEYS.employeePayments),
      priceOverrides: getFromStorage(STORAGE_KEYS.priceOverrides),
      exportedAt: getTimestamp(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAll: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.companies) setToStorage(STORAGE_KEYS.companies, data.companies);
      if (data.employees) setToStorage(STORAGE_KEYS.employees, data.employees);
      if (data.foodItems) setToStorage(STORAGE_KEYS.foodItems, data.foodItems);
      if (data.transactions) setToStorage(STORAGE_KEYS.transactions, data.transactions);
      if (data.companyPayments) setToStorage(STORAGE_KEYS.companyPayments, data.companyPayments);
      if (data.employeePayments) setToStorage(STORAGE_KEYS.employeePayments, data.employeePayments);
      if (data.priceOverrides) setToStorage(STORAGE_KEYS.priceOverrides, data.priceOverrides);
      return true;
    } catch {
      return false;
    }
  },

  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
