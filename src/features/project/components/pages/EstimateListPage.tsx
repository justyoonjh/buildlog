import React from 'react';
import { useProjectLogic } from '@/features/project/hooks/useProjectLogic';
import { EstimateList } from '../EstimateList';
import { EstimateForm } from '../estimate/EstimateForm';
import { useNavigate } from 'react-router-dom';

export const EstimateListPage: React.FC = () => {
  const { negotiatingEstimates, isLoading, fetchEstimates } = useProjectLogic();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = React.useState(false);

  // Check for pre-fill data from navigation (Consultation -> Proceed)
  const location = React.useMemo(() => window.location, []);
  // actually useLocation from router
  // We need to implement this logic properly.

  // Actually, let's keep it simple. If isCreating is true, show form.
  // The 'useProjectLogic' had logic to detect location.state and set isCreating.
  // We should move that logic HERE or into a specifically scoped hook.

  // Reuse the logic from ProjectView:
  // "Handle Navigation State from ConsultationView"

  // But wait, EstimateForm was rendered conditionally in ProjectView.
  // Should it be a separate route? `/project/estimate/new`?
  // User asked for Route-Based Architecture.
  // YES. `/project/estimate/create` or `/project/estimate/:id/edit`.

  // For now, to match existing functionality quickly, we can use conditional render here OR modal.
  // Route /project/estimate is the LIST.
  // Route /project/estimate/new is the FORM.
  // Route /project/estimate/:id is the DETAIL/EDIT FORM.

  // Let's implement the List first. Logic for create/edit will navigate to new routes.

  const handleCreate = () => {
    navigate('/project/estimate/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/project/estimate/${id}`);
  };

  return (
    <EstimateList
      estimates={negotiatingEstimates}
      isLoading={isLoading}
      onCreate={handleCreate}
      onEdit={handleEdit}
    />
  );
};
