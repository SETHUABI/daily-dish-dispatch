import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStorage } from "@/lib/storage/StorageContext";
import {
  localTransactions,
  localFoodItems,
  localEmployees,
  localCompanies,
} from "@/lib/storage/localStorage";
import type { FoodTransaction } from "@/lib/storage/types";

export type { FoodTransaction } from "@/lib/storage/types";

export interface TransactionWithDetails extends FoodTransaction {
  food_item_name: string;
  employee_name: string;
  company_name: string;
}

export function useTransactions(employeeId?: string, companyId?: string) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["transactions", employeeId, companyId, mode],
    queryFn: async () => {
      if (mode === "local") {
        const transactions = localTransactions.getAll(employeeId, companyId);
        const foodItems = localFoodItems.getAll();
        const employees = localEmployees.getAll();
        const companies = localCompanies.getAll();

        return transactions.map((t) => ({
          ...t,
          food_item_name: foodItems.find((f) => f.id === t.food_item_id)?.name || "",
          employee_name: employees.find((e) => e.id === t.employee_id)?.name || "",
          company_name: companies.find((c) => c.id === t.company_id)?.name || "",
        })) as TransactionWithDetails[];
      }

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
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (
      transactions: Omit<FoodTransaction, "id" | "created_at" | "updated_at">[]
    ) => {
      if (mode === "local") {
        return localTransactions.create(transactions);
      }

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
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (id: string) => {
      if (mode === "local") {
        const result = localTransactions.delete(id);
        if (!result) throw new Error("Transaction not found");
        return;
      }

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
