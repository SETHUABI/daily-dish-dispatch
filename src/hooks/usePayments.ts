import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStorage } from "@/lib/storage/StorageContext";
import {
  localCompanyPayments,
  localEmployeePayments,
  localCompanies,
  localEmployees,
} from "@/lib/storage/localStorage";
import type { CompanyPayment, EmployeePayment } from "@/lib/storage/types";

export type { CompanyPayment, EmployeePayment } from "@/lib/storage/types";

export function useCompanyPayments(companyId?: string) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["company-payments", companyId, mode],
    queryFn: async () => {
      if (mode === "local") {
        const payments = localCompanyPayments.getAll(companyId);
        const companies = localCompanies.getAll();

        return payments.map((p) => ({
          ...p,
          companies: { name: companies.find((c) => c.id === p.company_id)?.name || "" },
        }));
      }

      let query = supabase
        .from("company_payments")
        .select(`
          *,
          companies(name)
        `)
        .order("payment_date", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useEmployeePayments(employeeId?: string, companyId?: string) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["employee-payments", employeeId, companyId, mode],
    queryFn: async () => {
      if (mode === "local") {
        const payments = localEmployeePayments.getAll(employeeId, companyId);
        const employees = localEmployees.getAll();
        const companies = localCompanies.getAll();

        return payments.map((p) => ({
          ...p,
          employees: { name: employees.find((e) => e.id === p.employee_id)?.name || "" },
          companies: { name: companies.find((c) => c.id === p.company_id)?.name || "" },
        }));
      }

      let query = supabase
        .from("employee_payments")
        .select(`
          *,
          employees(name),
          companies(name)
        `)
        .order("payment_date", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCompanyPayment() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (payment: Omit<CompanyPayment, "id" | "created_at" | "updated_at">) => {
      if (mode === "local") {
        return localCompanyPayments.create(payment);
      }

      const { data, error } = await supabase
        .from("company_payments")
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-payments"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error("Failed to record payment: " + error.message);
    },
  });
}

export function useCreateEmployeePayment() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (payment: Omit<EmployeePayment, "id" | "created_at" | "updated_at">) => {
      if (mode === "local") {
        return localEmployeePayments.create(payment);
      }

      const { data, error } = await supabase
        .from("employee_payments")
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-payments"] });
      queryClient.invalidateQueries({ queryKey: ["employee-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error("Failed to record payment: " + error.message);
    },
  });
}

export function useDeleteCompanyPayment() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (id: string) => {
      if (mode === "local") {
        const result = localCompanyPayments.delete(id);
        if (!result) throw new Error("Payment not found");
        return;
      }

      const { error } = await supabase.from("company_payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-payments"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Payment deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete payment: " + error.message);
    },
  });
}

export function useDeleteEmployeePayment() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (id: string) => {
      if (mode === "local") {
        const result = localEmployeePayments.delete(id);
        if (!result) throw new Error("Payment not found");
        return;
      }

      const { error } = await supabase.from("employee_payments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-payments"] });
      queryClient.invalidateQueries({ queryKey: ["employee-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Payment deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete payment: " + error.message);
    },
  });
}
