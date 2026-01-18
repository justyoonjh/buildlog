import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/features/home/components/BottomNavigation';
import { Tab } from '@/types';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('home');
    } else if (location.pathname.startsWith('/project')) {
      setActiveTab('project');
    } else if (location.pathname.startsWith('/portfolio')) {
      setActiveTab('portfolio');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'home') navigate('/');
    else if (tab === 'project') navigate('/project'); // This redirects to /project/consultation via router
    else if (tab === 'portfolio') navigate('/portfolio');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative pb-[60px] h-full overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};
