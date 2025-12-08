import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FoodItem {
  id: string;
  name: string;
  category: string | null;
  default_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useFoodItems(activeOnly = false) {
  return useQuery({
    queryKey: ["food-items", activeOnly],
    queryFn: async () => {
      let query = supabase.from("food_items").select("*").order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FoodItem[];
    },
  });
}

export function useCreateFoodItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<FoodItem, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("food_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-items"] });
      toast.success("Food item created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create food item: " + error.message);
    },
  });
}

export function useUpdateFoodItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<FoodItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("food_items")
        .update(item)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-items"] });
      toast.success("Food item updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update food item: " + error.message);
    },
  });
}

export function useDeleteFoodItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("food_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-items"] });
      toast.success("Food item deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete food item: " + error.message);
    },
  });
}
