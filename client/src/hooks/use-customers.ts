import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCustomer, type UpdateCustomerRequest, type Customer } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Helper to handle API responses and validation
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${res.status}`);
  }
  
  return res.json();
}

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: [api.customers.list.path, search],
    queryFn: async () => {
      const url = new URL(api.customers.list.path, window.location.origin);
      if (search) url.searchParams.append("search", search);
      
      const data = await fetchApi(url.toString());
      return api.customers.list.responses[200].parse(data);
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [api.customers.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.customers.get.path, { id });
      const data = await fetchApi(url);
      return api.customers.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCustomerByPhone(phone: string) {
  return useQuery({
    queryKey: [api.customers.getByPhone.path, phone],
    queryFn: async () => {
      if (!phone) return null;
      const url = buildUrl(api.customers.getByPhone.path, { phone });
      try {
        const data = await fetchApi(url);
        return api.customers.getByPhone.responses[200].parse(data);
      } catch (err: any) {
        if (err.message.includes("404")) return null;
        throw err;
      }
    },
    enabled: phone.length >= 10,
    retry: false,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customer: InsertCustomer) => {
      const validated = api.customers.create.input.parse(customer);
      const data = await fetchApi(api.customers.create.path, {
        method: api.customers.create.method,
        body: JSON.stringify(validated),
      });
      return api.customers.create.responses[201].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
      toast({
        title: "Customer created",
        description: "Successfully added new customer.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdateCustomerRequest) => {
      const validated = api.customers.update.input.parse(updates);
      const url = buildUrl(api.customers.update.path, { id });
      const data = await fetchApi(url, {
        method: api.customers.update.method,
        body: JSON.stringify(validated),
      });
      return api.customers.update.responses[200].parse(data);
    },
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: [api.customers.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.customers.get.path, updatedCustomer.id] });
      queryClient.invalidateQueries({ queryKey: [api.customers.getByPhone.path] });
    },
    onError: (err: Error) => {
      toast({
        title: "Error updating customer",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}
