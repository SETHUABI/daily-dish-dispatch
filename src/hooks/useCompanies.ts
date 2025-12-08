import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export interface CompanyWithStats extends Company {
  employee_count: number;
  total_purchases: number;
  total_payments: number;
  outstanding: number;
}

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
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
  return useQuery({
    queryKey: ["companies-with-stats"],
    queryFn: async () => {
      // Get companies
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (companiesError) throw companiesError;

      // Get employee counts
      const { data: employees, error: empError } = await supabase
        .from("employees")
        .select("company_id");

      if (empError) throw empError;

      // Get transactions totals
      const { data: transactions, error: txnError } = await supabase
        .from("food_transactions")
        .select("company_id, total_amount");

      if (txnError) throw txnError;

      // Get company payments
      const { data: companyPayments, error: cpError } = await supabase
        .from("company_payments")
        .select("company_id, amount");

      if (cpError) throw cpError;

      // Get employee payments
      const { data: employeePayments, error: epError } = await supabase
        .from("employee_payments")
        .select("company_id, amount");

      if (epError) throw epError;

      // Calculate stats per company
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
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!companyId) return null;

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

  return useMutation({
    mutationFn: async (company: Omit<Company, "id" | "created_at" | "updated_at">) => {
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

  return useMutation({
    mutationFn: async ({ id, ...company }: Partial<Company> & { id: string }) => {
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

  return useMutation({
    mutationFn: async (id: string) => {
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
