import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/features/home/components/BottomNavigation';
import { Tab } from '@/types';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { UserProfileModal } from '@/features/home/components/UserProfileModal';
import { CompanyInfoModal } from '@/features/company/components/CompanyInfoModal';
import { useUIStore } from '@/shared/stores/useUIStore';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { isProfileOpen, closeProfile, isCompanyInfoOpen, closeCompanyInfo } = useUIStore();

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
    else if (tab === 'project') navigate('/project');
    else if (tab === 'portfolio') navigate('/portfolio');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Global Header */}
      <HomeHeader
        showTodayButton={activeTab === 'home'}
      // onTodayClick is temporarily omitted until we move calendar state to global
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative pb-[60px] h-full overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Global Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={closeProfile}
      />
      <CompanyInfoModal
        isOpen={isCompanyInfoOpen}
        onClose={closeCompanyInfo}
      />
    </div>
  );
};
