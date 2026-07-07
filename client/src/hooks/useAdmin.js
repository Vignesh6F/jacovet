import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Fetch audit logs (Super Admin)
export const useAuditLogs = (enabled = true) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: async () => {
      const response = await api.get('/admin/audit-logs');
      return response.data;
    },
    enabled
  });
};

// Clinic Admin: Checkout Billing
export const useCompleteCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, billAmount }) => {
      const response = await api.put(`/admin/checkout/${id}`, { billAmount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};

// Super Admin: Update Vet Subscription Plan
export const useUpdateVetPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, plan }) => {
      const response = await api.put(`/admin/vet-plan/${id}`, { plan });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directories'] });
    }
  });
};
