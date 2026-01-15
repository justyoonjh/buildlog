import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { ConstructionStage } from '@/types';
import toast from 'react-hot-toast';

export const useConstructionStages = (projectId: string) => {
  const queryClient = useQueryClient();

  // 1. Fetch Stages
  const { data: stages = [], isLoading, error } = useQuery({
    queryKey: ['stages', projectId],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; stages: ConstructionStage[] }>(`/stages/${projectId}`);
      if (!res.data.success) throw new Error('Failed to fetch stages');
      return res.data.stages;
    },
    enabled: !!projectId, // Only fetch if projectId exists
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // 2. Create Stage
  const createStageMutation = useMutation({
    mutationFn: async (newStage: Partial<ConstructionStage>) => {
      const res = await apiClient.post('/stages', { ...newStage, projectId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages', projectId] });
      toast.success('공사 단계가 추가되었습니다.');
    },
    onError: () => {
      toast.error('단계 추가에 실패했습니다.');
    }
  });

  // 3. Update Stage
  const updateStageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ConstructionStage> }) => {
      const res = await apiClient.put(`/stages/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages', projectId] });
      toast.success('공사 단계가 수정되었습니다.');
    },
    onError: () => {
      toast.error('단계 수정에 실패했습니다.');
    }
  });

  // 4. Delete Stage
  const deleteStageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/stages/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages', projectId] });
      toast.success('공사 단계가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('단계 삭제에 실패했습니다.');
    }
  });

  return {
    stages,
    isLoading,
    error,
    createStage: createStageMutation.mutateAsync,
    updateStage: updateStageMutation.mutateAsync,
    deleteStage: deleteStageMutation.mutateAsync,
    isCreating: createStageMutation.isPending,
    isUpdating: updateStageMutation.isPending,
    isDeleting: deleteStageMutation.isPending
  };
};
