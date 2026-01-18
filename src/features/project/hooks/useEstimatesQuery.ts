import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Estimate, EstimatesResponse } from '@/types';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

interface UseEstimatesParams {
  status?: string;
  page?: number;
  limit?: number;
}

export const useEstimatesQuery = (params: UseEstimatesParams = {}) => {
  return useQuery({
    queryKey: ['estimates', params], // Unique key for filtering
    queryFn: async () => {
      const { data } = await apiClient.get<EstimatesResponse>('/estimates', { params });
      return data; // Expected to have { estimates, total, page, totalPages, ... }
    },
    // Keep previous data while fetching new page for smooth transition
    placeholderData: (previousData) => previousData, 
  });
};
