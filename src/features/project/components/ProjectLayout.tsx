import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ProjectNavBar } from './ProjectNavBar';
import { Tab } from '@/types';

export const ProjectLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('consultation');

  useEffect(() => {
    // Sync activeTab with URL
    if (location.pathname.includes('/consultation')) setActiveTab('consultation');
    else if (location.pathname.includes('/estimate')) setActiveTab('estimate');
    else if (location.pathname.includes('/contract')) setActiveTab('contract');
    else if (location.pathname.includes('/construction')) setActiveTab('construction');
    else if (location.pathname.includes('/completed')) setActiveTab('completed');
  }, [location.pathname]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    navigate(`/project/${tab}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full relative">
      <ProjectNavBar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
