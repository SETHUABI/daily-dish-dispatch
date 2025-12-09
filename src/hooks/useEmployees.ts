import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStorage } from "@/lib/storage/StorageContext";
import {
  localEmployees,
  localCompanies,
  localTransactions,
  localEmployeePayments,
} from "@/lib/storage/localStorage";
import type { Employee } from "@/lib/storage/types";

export type { Employee } from "@/lib/storage/types";

export interface EmployeeWithCompany extends Employee {
  company_name: string;
}

export interface EmployeeWithStats extends EmployeeWithCompany {
  total_purchases: number;
  total_payments: number;
  outstanding: number;
}

export function useEmployees(companyId?: string) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["employees", companyId, mode],
    queryFn: async () => {
      if (mode === "local") {
        const employees = localEmployees.getAll(companyId);
        const companies = localCompanies.getAll();

        return employees.map((emp) => ({
          ...emp,
          company_name: companies.find((c) => c.id === emp.company_id)?.name || "",
        })) as EmployeeWithCompany[];
      }

      let query = supabase
        .from("employees")
        .select(`
          *,
          companies!inner(name)
        `)
        .order("name");

      if (companyId && companyId !== "all") {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((emp) => ({
        ...emp,
        company_name: emp.companies?.name || "",
      })) as EmployeeWithCompany[];
    },
  });
}

export function useEmployeesWithStats(companyId?: string) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["employees-with-stats", companyId, mode],
    queryFn: async () => {
      if (mode === "local") {
        const employees = localEmployees.getAll(companyId);
        const companies = localCompanies.getAll();
        const transactions = localTransactions.getAll();
        const payments = localEmployeePayments.getAll();

        return employees.map((emp) => {
          const totalPurchases = transactions
            .filter((t) => t.employee_id === emp.id)
            .reduce((sum, t) => sum + Number(t.total_amount), 0);
          const totalPayments = payments
            .filter((p) => p.employee_id === emp.id)
            .reduce((sum, p) => sum + Number(p.amount), 0);

          return {
            ...emp,
            company_name: companies.find((c) => c.id === emp.company_id)?.name || "",
            total_purchases: totalPurchases,
            total_payments: totalPayments,
            outstanding: totalPurchases - totalPayments,
          };
        }) as EmployeeWithStats[];
      }

      let query = supabase
        .from("employees")
        .select(`
          *,
          companies!inner(name)
        `)
        .order("name");

      if (companyId && companyId !== "all") {
        query = query.eq("company_id", companyId);
      }

      const { data: employees, error } = await query;
      if (error) throw error;

      const { data: transactions, error: txnError } = await supabase
        .from("food_transactions")
        .select("employee_id, total_amount");
      if (txnError) throw txnError;

      const { data: payments, error: payError } = await supabase
        .from("employee_payments")
        .select("employee_id, amount");
      if (payError) throw payError;

      return employees.map((emp) => {
        const totalPurchases = transactions
          .filter((t) => t.employee_id === emp.id)
          .reduce((sum, t) => sum + Number(t.total_amount), 0);
        const totalPayments = payments
          .filter((p) => p.employee_id === emp.id)
          .reduce((sum, p) => sum + Number(p.amount), 0);

        return {
          ...emp,
          company_name: emp.companies?.name || "",
          total_purchases: totalPurchases,
          total_payments: totalPayments,
          outstanding: totalPurchases - totalPayments,
        };
      }) as EmployeeWithStats[];
    },
  });
}

export function useEmployee(employeeId: string | undefined) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["employee", employeeId, mode],
    queryFn: async () => {
      if (!employeeId) return null;

      if (mode === "local") {
        const employee = localEmployees.getById(employeeId);
        if (!employee) return null;

        const companies = localCompanies.getAll();
        return {
          ...employee,
          company_name: companies.find((c) => c.id === employee.company_id)?.name || "",
        } as EmployeeWithCompany;
      }

      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          companies!inner(name)
        `)
        .eq("id", employeeId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        company_name: data.companies?.name || "",
      } as EmployeeWithCompany;
    },
    enabled: !!employeeId,
  });
}

export function useEmployeeWithStats(employeeId: string | undefined) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["employee-with-stats", employeeId, mode],
    queryFn: async () => {
      if (!employeeId) return null;

      if (mode === "local") {
        const employee = localEmployees.getById(employeeId);
        if (!employee) return null;

        const companies = localCompanies.getAll();
        const transactions = localTransactions.getAll(employeeId);
        const payments = localEmployeePayments.getAll(employeeId);

        const totalPurchases = transactions.reduce((sum, t) => sum + Number(t.total_amount), 0);
        const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
          ...employee,
          company_name: companies.find((c) => c.id === employee.company_id)?.name || "",
          total_purchases: totalPurchases,
          total_payments: totalPayments,
          outstanding: totalPurchases - totalPayments,
          transactions,
          payments,
        };
      }

      const { data: employee, error } = await supabase
        .from("employees")
        .select(`
          *,
          companies!inner(name)
        `)
        .eq("id", employeeId)
        .maybeSingle();

      if (error) throw error;
      if (!employee) return null;

      const { data: transactions, error: txnError } = await supabase
        .from("food_transactions")
        .select("*")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false });
      if (txnError) throw txnError;

      const { data: payments, error: payError } = await supabase
        .from("employee_payments")
        .select("*")
        .eq("employee_id", employeeId)
        .order("payment_date", { ascending: false });
      if (payError) throw payError;

      const totalPurchases = transactions.reduce((sum, t) => sum + Number(t.total_amount), 0);
      const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        ...employee,
        company_name: employee.companies?.name || "",
        total_purchases: totalPurchases,
        total_payments: totalPayments,
        outstanding: totalPurchases - totalPayments,
        transactions,
        payments,
      };
    },
    enabled: !!employeeId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, "id" | "created_at" | "updated_at">) => {
      if (mode === "local") {
        return localEmployees.create(employee);
      }

      const { data, error } = await supabase
        .from("employees")
        .insert(employee)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Employee created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create employee: " + error.message);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async ({ id, ...employee }: Partial<Employee> & { id: string }) => {
      if (mode === "local") {
        const result = localEmployees.update(id, employee);
        if (!result) throw new Error("Employee not found");
        return result;
      }

      const { data, error } = await supabase
        .from("employees")
        .update(employee)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      toast.success("Employee updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update employee: " + error.message);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (id: string) => {
      if (mode === "local") {
        const result = localEmployees.delete(id);
        if (!result) throw new Error("Employee not found");
        return;
      }

      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Employee deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete employee: " + error.message);
    },
  });
}
