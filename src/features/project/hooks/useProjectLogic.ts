import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { Estimate, Tab, EstimatesResponse, EstimateDetailResponse } from '@/types';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const useProjectLogic = (initialProjectId?: string, initialTab?: Tab) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('consultation');
  const [isCreatingEstimate, setIsCreatingEstimate] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [selectedProject, setSelectedProject] = useState<Estimate | null>(null);

  // React Query: Fetch Estimates
  const { data: estimates = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.estimates.all,
    queryFn: async () => {
      const res = await apiClient.get<EstimatesResponse>('/estimates');
      return res.data.success ? res.data.estimates : [];
    },
    staleTime: 60 * 1000,
  });

  // Manual refetch wrapper (to keep API consistent with view)
  const fetchEstimates = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.estimates.all });
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }

    // Handle Deep Link
    if (initialProjectId) {
      const loadInitialProject = async () => {
        try {
          const res = await apiClient.get<EstimateDetailResponse>(`/estimates/${initialProjectId}`);
          if (res.data.success) {
            const project = res.data.estimate;
            if (project.status === 'contracted' || project.status === 'construction') {
              setActiveTab('construction');
              setSelectedProject(project);
            } else if (project.status === 'completed') {
              setActiveTab('completed');
            } else if (project.status === 'contract_ready') {
              setActiveTab('contract');
            } else {
              setActiveTab('estimate');
              setEditingEstimate(project);
            }
          }
        } catch (error: any) {
          console.warn('Failed to load initial project:', error);
          // If 404, likely ID mismatch due to DB wipe. Clear URL.
          if (error.response && error.response.status === 404) {
            navigate('/?tab=project', { replace: true });
          }
        }
      };
      loadInitialProject();
    }
  }, [initialProjectId, initialTab, navigate]);


  // Handle edit click - navigate to detail view
  const handleEditEstimate = async (id: string, isReadOnly: boolean = false) => {
    navigate(`/projects/${id}`);
  };

  // Filtered Logic (Memoized usually, but simple here)
  const consultationProjects = estimates.filter(e => e.status === 'consultation');
  const negotiatingEstimates = estimates.filter(e => e.status === 'draft' || e.status === 'negotiating');
  const contractReadyEstimates = estimates.filter(e => e.status === 'contract_ready');
  const contractedEstimates = estimates.filter(e => e.status === 'contracted' || e.status === 'construction');
  const completedProjects = estimates.filter(e => e.status === 'completed');

  return {
    activeTab,
    setActiveTab,
    isCreatingEstimate,
    setIsCreatingEstimate,
    editingEstimate,
    setEditingEstimate,
    estimates,
    isLoading,
    selectedProject,
    setSelectedProject,
    fetchEstimates,
    handleEditEstimate,

    // Filtered Lists
    consultationProjects,
    negotiatingEstimates,
    contractReadyEstimates, // Used in ContractView?
    contractedEstimates,
    completedProjects
  };
};
