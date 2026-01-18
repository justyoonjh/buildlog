import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConstructionDetail from '../ConstructionDetail';
import apiClient from '@/services/apiClient';
import { Estimate } from '@/types';

export const ConstructionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Estimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      try {
        const res = await apiClient.get(\`/estimates/\${id}\`);
        if (res.data.success) {
            setProject(res.data.estimate);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        alert('프로젝트를 불러올 수 없습니다.');
        navigate('/project/construction');
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  }, [id, navigate]);

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <ConstructionDetail
      project={project}
      onBack={() => navigate('/project/construction')}
    />
  );
};
