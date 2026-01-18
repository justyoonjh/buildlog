import React, { useState } from 'react';
import { useEstimatesQuery } from '@/features/project/hooks/useEstimatesQuery';
import { CompletedList } from '../CompletedList';

export const CompletedListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useEstimatesQuery({ status: 'completed', page, limit: 12 });

  const handleSelect = (id: string) => {
    window.open(`/report/${id}`, '_blank');
  };

  return (
    <CompletedList
      projects={data?.estimates || []}
      isLoading={isLoading}
      onSelect={handleSelect}
    />
  );
};
