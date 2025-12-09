import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStorage } from "@/lib/storage/StorageContext";
import { localFoodItems } from "@/lib/storage/localStorage";
import type { FoodItem } from "@/lib/storage/types";

export type { FoodItem } from "@/lib/storage/types";

export function useFoodItems(activeOnly = false) {
  const { mode } = useStorage();

  return useQuery({
    queryKey: ["food-items", activeOnly, mode],
    queryFn: async () => {
      if (mode === "local") {
        return localFoodItems.getAll(activeOnly);
      }

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
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (item: Omit<FoodItem, "id" | "created_at" | "updated_at">) => {
      if (mode === "local") {
        return localFoodItems.create(item);
      }

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
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<FoodItem> & { id: string }) => {
      if (mode === "local") {
        const result = localFoodItems.update(id, item);
        if (!result) throw new Error("Food item not found");
        return result;
      }

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
  const { mode } = useStorage();

  return useMutation({
    mutationFn: async (id: string) => {
      if (mode === "local") {
        const result = localFoodItems.delete(id);
        if (!result) throw new Error("Food item not found");
        return;
      }

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
