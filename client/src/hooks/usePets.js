import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Fetch current owner's pets
export const useMyPets = (enabled = true) => {
  return useQuery({
    queryKey: ['pets', 'my'],
    queryFn: async () => {
      const response = await api.get('/pets/my');
      return response.data;
    },
    enabled
  });
};

// Search pet records (for doctors)
export const useSearchPets = (searchQuery) => {
  return useQuery({
    queryKey: ['pets', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await api.get(`/pets/search?q=${searchQuery}`);
      return response.data;
    },
    enabled: !!searchQuery
  });
};

// Add a new pet mutation
export const useAddPet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (petData) => {
      const response = await api.post('/pets/add', petData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate pets cache to trigger auto reload
      queryClient.invalidateQueries({ queryKey: ['pets', 'my'] });
    }
  });
};
