import React, { useState } from 'react';
import { useEstimatesQuery } from '@/features/project/hooks/useEstimatesQuery';
import { ConstructionList } from '../ConstructionList';
import { useNavigate } from 'react-router-dom';

export const ConstructionListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEstimatesQuery({ status: 'construction', page, limit: 12 });
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    navigate(`/project/construction/${id}`);
  };

  return (
    <ConstructionList
      projects={data?.estimates || []}
      isLoading={isLoading}
      onSelect={handleSelect}
    />
  );
};
