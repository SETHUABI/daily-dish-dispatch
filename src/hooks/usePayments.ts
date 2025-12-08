import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export function useCompanyPayments(companyId?: string) {
  return useQuery({
    queryKey: ["company-payments", companyId],
    queryFn: async () => {
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
  return useQuery({
    queryKey: ["employee-payments", employeeId, companyId],
    queryFn: async () => {
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

  return useMutation({
    mutationFn: async (payment: Omit<CompanyPayment, "id" | "created_at" | "updated_at">) => {
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

  return useMutation({
    mutationFn: async (payment: Omit<EmployeePayment, "id" | "created_at" | "updated_at">) => {
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

  return useMutation({
    mutationFn: async (id: string) => {
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

  return useMutation({
    mutationFn: async (id: string) => {
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
