import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Fetch current user appointments based on role
export const useAppointments = (role, enabled = true) => {
  return useQuery({
    queryKey: ['appointments', role],
    queryFn: async () => {
      let endpoint = '/appointments/owner';
      if (role === 'doctor') endpoint = '/appointments/doctor';
      if (role === 'admin') endpoint = '/appointments/admin';
      
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled
  });
};

// Book a new appointment
export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (apptData) => {
      const response = await api.post('/appointments/book', apptData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};

// Cancel an appointment
export const useCancelAppointment = (role) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.put(`/appointments/cancel/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};

// Reschedule an appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date, time }) => {
      const response = await api.put(`/appointments/reschedule/${id}`, { date, time });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};

// Fetch booked slots for a veterinarian
export const useBookedSlots = (vetId, date, enabled = true) => {
  return useQuery({
    queryKey: ['appointments', 'booked', vetId, date],
    queryFn: async () => {
      if (!vetId) return [];
      const response = await api.get(`/appointments/booked/${vetId}`, {
        params: { date }
      });
      return response.data;
    },
    enabled: !!vetId && enabled
  });
};
