import React from 'react';
import { ContractView } from '../ContractView';
import { useNavigate } from 'react-router-dom';

export const ContractPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ContractView
      onSelectProject={(id) => {
        if (id === 'SWITCH_TO_CONSTRUCTION') {
          navigate('/project/construction');
        } else {
          // Edit/Sign Contract -> Navigate to Estimate Detail (Contract Mode)?
          // Original logic called handleEditEstimate(id).
          navigate(`/project/estimate/${id}`);
        }
      }}
    />
  );
};
