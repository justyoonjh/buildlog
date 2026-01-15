import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Estimate, EstimatesResponse } from '@/types';
import apiClient from '@/services/apiClient';

export const useHomeLogic = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string | undefined>(undefined);

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
    navigate(`/projects/${projectId}`);
  };

  return {
    activeTab,
    setActiveTab,
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
