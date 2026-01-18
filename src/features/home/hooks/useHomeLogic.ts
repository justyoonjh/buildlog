import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Estimate, EstimatesResponse } from '@/types';
import apiClient from '@/services/apiClient';

import { useSearchParams } from 'react-router-dom';

export const useHomeLogic = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'home';
  const initialProjectTab = searchParams.get('project_tab'); // 'consultation', 'estimate', etc.
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string | undefined>(undefined);

  // Sync tab changes to URL (optional but good for history)
  // modifying URL might be tricky if we want to avoid reload, but let's just read it for now.


  // Modal States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // React Query: Fetch Estimates
  const { data: estimates = [] } = useQuery({
    queryKey: ['estimates'],
    queryFn: async () => {
      const res = await apiClient.get<EstimatesResponse>('/estimates');
      return res.data.success ? res.data.estimates : [];
    },
    staleTime: 60 * 1000,
  });

  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    setActiveTab('project');
    setTargetProjectId(projectId);
  };

  return {
    activeTab,
    setActiveTab,
    initialProjectTab,
    selectedDate,
    setSelectedDate,
    isSheetExpanded,
    setIsSheetExpanded,
    estimates,
    targetProjectId,
    handleProjectClick,

    // Modal States & Setters
    isProfileOpen,
    setIsProfileOpen,
    isBusinessInfoOpen,
    setIsBusinessInfoOpen,
    isConsultationModalOpen,
    setIsConsultationModalOpen
  };
};
