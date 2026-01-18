import React from 'react';
import { useProjectLogic } from '@/features/project/hooks/useProjectLogic';
import { ConsultationView } from './ConsultationView';
import { useNavigate } from 'react-router-dom';

export const ConsultationPage: React.FC = () => {
  const { consultationProjects } = useProjectLogic();
  const navigate = useNavigate();

  const handleSelectProject = (id: string) => {
    // Navigate to estimate creation logic or detail?
    // In old ProjectView, it passed state to navigate to estimate tab.
    // New logic: Navigate to Estimate Page with pre-fill?
    // Let's keep the existing logic: "Proceed" -> Estimate Page.
    // The "Proceed" button in ConsultationView already handles navigation!
    // But verify: ConsultationView calls navigate with state.
    // Just need to make sure the target URL is correct in ConsultationView.
  };

  return (
    <ConsultationView
      projects={consultationProjects}
      onSelectProject={handleSelectProject}
    />
  );
};
