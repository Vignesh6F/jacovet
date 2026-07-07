import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useDirectories = () => {
  return useQuery({
    queryKey: ['directories'],
    queryFn: async () => {
      const response = await api.get('/admin/directories');
      return response.data; // returns { clinics, vets }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes stale time
  });
};
