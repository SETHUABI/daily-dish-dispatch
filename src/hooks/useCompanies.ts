import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStorage } from "@/lib/storage/StorageContext";
import {
  localCompanies,
  localEmployees,
  localTransactions,
  localCompanyPayments,
  localEmployeePayments,
} from "@/lib/storage/localStorage";
import type { Company } from "@/lib/storage/types";

export type { Company } from "@/lib/storage/types";

export interface CompanyWithStats extends Company {
  employee_count: number;
  total_purchases: number;
  total_payments: number;
  outstanding: number;
}

export function useCompanies() {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["companies", mode],
    queryFn: async () => {
      if (mode === "local") {
        return localCompanies.getAll();
      }

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Company[];
    },
  });
}

export function useCompaniesWithStats() {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["companies-with-stats", mode],
    queryFn: async () => {
      if (mode === "local") {
        const companies = localCompanies.getAll();
        const employees = localEmployees.getAll();
        const transactions = localTransactions.getAll();
        const companyPayments = localCompanyPayments.getAll();
        const employeePayments = localEmployeePayments.getAll();

        return companies.map((company) => {
          const employeeCount = employees.filter((e) => e.company_id === company.id).length;
          const totalPurchases = transactions
            .filter((t) => t.company_id === company.id)
            .reduce((sum, t) => sum + Number(t.total_amount), 0);
          const totalCompanyPayments = companyPayments
            .filter((p) => p.company_id === company.id)
            .reduce((sum, p) => sum + Number(p.amount), 0);
          const totalEmployeePayments = employeePayments
            .filter((p) => p.company_id === company.id)
            .reduce((sum, p) => sum + Number(p.amount), 0);
          const totalPayments = totalCompanyPayments + totalEmployeePayments;

          return {
            ...company,
            employee_count: employeeCount,
            total_purchases: totalPurchases,
            total_payments: totalPayments,
            outstanding: totalPurchases - totalPayments,
          };
        }) as CompanyWithStats[];
      }

      // Cloud mode
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (companiesError) throw companiesError;

      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("company_id");

      if (empError) throw empError;

      const { data: transactions, error: txnError } = await supabase
        .from("food_transactions")
        .select("company_id, total_amount");

      if (txnError) throw txnError;

      const { data: companyPayments, error: cpError } = await supabase
        .from("company_payments")
        .select("company_id, amount");

      if (cpError) throw cpError;

      const { data: employeePayments, error: epError } = await supabase
        .from("employee_payments")
        .select("company_id, amount");

      if (epError) throw epError;

      const companiesWithStats: CompanyWithStats[] = companies.map((company) => {
        const employeeCount = employees.filter((e) => e.company_id === company.id).length;
        const totalPurchases = transactions
          .filter((t) => t.company_id === company.id)
          .reduce((sum, t) => sum + Number(t.total_amount), 0);
        const totalCompanyPayments = companyPayments
          .filter((p) => p.company_id === company.id)
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const totalEmployeePayments = employeePayments
          .filter((p) => p.company_id === company.id)
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const totalPayments = totalCompanyPayments + totalEmployeePayments;

        return {
          ...company,
          employee_count: employeeCount,
          total_purchases: totalPurchases,
          total_payments: totalPayments,
          outstanding: totalPurchases - totalPayments,
        };
      });

      return companiesWithStats;
    },
  });
}

export function useCompany(companyId: string | undefined) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["company", companyId, mode],
    queryFn: async () => {
      if (!companyId) return null;

      if (mode === "local") {
        return localCompanies.getById(companyId);
      }

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();

      if (error) throw error;
      return data as Company | null;
    },
    enabled: !!companyId,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (company: Omit<Company, "id" | "created_at" | "updated_at">) => {
      if (mode === "local") {
        return localCompanies.create(company);
      }

      const { data, error } = await supabase
        .from("companies")
        .insert(company)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Company created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create company: " + error.message);
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async ({ id, ...company }: Partial<Company> & { id: string }) => {
      if (mode === "local") {
        const result = localCompanies.update(id, company);
        if (!result) throw new Error("Company not found");
        return result;
      }

      const { data, error } = await supabase
        .from("companies")
        .update(company)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Company updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update company: " + error.message);
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (id: string) => {
      if (mode === "local") {
        const result = localCompanies.delete(id);
        if (!result) throw new Error("Company not found");
        return;
      }

      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Company deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete company: " + error.message);
    },
  });
}
