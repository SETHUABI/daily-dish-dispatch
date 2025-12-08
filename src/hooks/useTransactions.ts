import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export interface TransactionWithDetails extends FoodTransaction {
  food_item_name: string;
  employee_name: string;
  company_name: string;
}

export function useTransactions(employeeId?: string, companyId?: string) {
  return useQuery({
    queryKey: ["transactions", employeeId, companyId],
    queryFn: async () => {
      let query = supabase
        .from("food_transactions")
        .select(`
          *,
          food_items(name),
          employees(name),
          companies(name)
        `)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((t) => ({
        ...t,
        food_item_name: t.food_items?.name || "",
        employee_name: t.employees?.name || "",
        company_name: t.companies?.name || "",
      })) as TransactionWithDetails[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      transactions: Omit<FoodTransaction, "id" | "created_at" | "updated_at">[]
    ) => {
      const { data, error } = await supabase
        .from("food_transactions")
        .insert(transactions)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["employee-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Order saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save order: " + error.message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("food_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["employee-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["companies-with-stats"] });
      toast.success("Transaction deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete transaction: " + error.message);
    },
  });
}
