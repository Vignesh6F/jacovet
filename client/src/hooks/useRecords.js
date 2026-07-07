import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Fetch single pet's lifelong timeline (gated / cross-clinic lookup)
export const usePetTimeline = (petId, enabled = true) => {
  return useQuery({
    queryKey: ['records', 'timeline', petId],
    queryFn: async () => {
      if (!petId) return null;
      const response = await api.get(`/records/timeline/${petId}`);
      return response.data; // returns { pet, records }
    },
    enabled: !!petId && enabled
  });
};

// Add consultation check-in report mutation
export const useAddConsultRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (consultData) => {
      const response = await api.post('/records/consult', consultData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['records', 'timeline', variables.petId] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });
};
