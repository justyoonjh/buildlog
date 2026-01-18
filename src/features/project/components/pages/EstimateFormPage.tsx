import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { EstimateForm } from '../estimate/EstimateForm';
import apiClient from '@/services/apiClient';
import { Estimate } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

export const EstimateFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [initialData, setInitialData] = useState<Estimate | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const res = await apiClient.get(\`/estimates/\${id}\`);
          if (res.data.success) {
            setInitialData(res.data.estimate);
          }
        } catch (error) {
          console.error('Failed to load estimate:', error);
          alert('견적 정보를 불러오는데 실패했습니다.');
          navigate('/project/estimate');
        } finally {
          setIsLoading(false);
        }
      } else if (location.state && location.state.consultationData) {
        // Handle data passed from Consultation "Proceed"
        const data = location.state.consultationData;
        setInitialData({
          ...data,
          id: data.id,
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          clientName: data.clientName || '',
          clientPhone: data.clientPhone || '',
          siteAddress: data.siteAddress || '',
        } as Estimate);
      }
    };
    loadData();
  }, [id, location.state, navigate]);

  const handleComplete = (result: Estimate | null) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.estimates.all });
    
    if (result?.status === 'contract_ready') {
      navigate('/project/contract');
    } else if (result?.status === 'contracted') {
      navigate(\`/project/construction/\${result.id}\`);
    } else {
      navigate('/project/estimate');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <EstimateForm
      initialData={initialData}
      onBack={() => navigate(-1)}
      onComplete={handleComplete}
    />
  );
};
