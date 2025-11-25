import React, { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { User } from './types';
import { LogOut, ClipboardList, UserCircle } from 'lucide-react';
import { Button } from './components/Button';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Render Login Screen if not authenticated
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Render Dashboard/Placeholder if authenticated
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">공사_log</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" className="border-blue-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  대시보드
                </a>
                <a href="#" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  작업 일지
                </a>
                <a href="#" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  현장 관리
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center gap-3 mr-4">
                 <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-slate-900">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.id}</span>
                 </div>
                 <UserCircle className="h-8 w-8 text-slate-400" />
              </div>
              <Button variant="outline" onClick={handleLogout} className="ml-2">
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Placeholder */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-slate-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-slate-900">
              오늘의 현장 현황
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {new Date().toLocaleDateString()} 기준
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
             <div className="border-2 border-dashed border-slate-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                    <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">등록된 일지가 없습니다</h3>
                    <p className="mt-1 text-sm text-slate-500">새로운 작업 일지를 작성해주세요.</p>
                    <div className="mt-6">
                        <Button>일지 작성하기</Button>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;