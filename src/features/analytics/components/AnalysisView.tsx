import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Briefcase, ChevronRight, Activity } from 'lucide-react';
import apiClient from '@/services/apiClient';

export const AnalysisView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/estimates');
      if (res.data.success) {
        setEstimates(res.data.estimates);
      }
    } catch (error) {
      console.error('Failed to fetch analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">데이터 분석 중...</span>
        </div>
      </div>
    );
  }

  // --- Calculations ---

  // 1. Project Counts
  const totalProjects = estimates.length;
  const contractedProjects = estimates.filter(e => e.status === 'contracted' || e.status === 'completed');
  const negotiationProjects = estimates.filter(e => e.status === 'draft' || e.status === 'negotiating');

  // 2. Revenue (Contracted only)
  const totalRevenue = contractedProjects.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const potentialRevenue = negotiationProjects.reduce((sum, e) => sum + (e.totalAmount || 0), 0);

  // 3. Monthly Revenue Trend (Last 6 months)
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: `${d.getMonth() + 1}월`,
        key: `${d.getFullYear()}-${d.getMonth()}`,
        amount: 0
      });
    }
    return months;
  };

  const monthlyData = getLast6Months();
  contractedProjects.forEach(e => {
    const d = new Date(e.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const month = monthlyData.find(m => m.key === key);
    if (month) {
      month.amount += (e.totalAmount || 0);
    }
  });

  const maxMonthlyAmount = Math.max(...monthlyData.map(m => m.amount), 1); // Avoid div by zero

  // 4. Recent Contracts
  const recentContracts = [...contractedProjects]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">경영 분석 대시보드</h2>
        <p className="text-xs text-slate-500">실시간 프로젝트 및 매출 현황 리포트</p>
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-medium">
              <DollarSign size={14} className="text-blue-500" />
              확정 매출액
            </div>
            <div className="text-lg font-bold text-slate-800">
              {(totalRevenue / 100000000).toFixed(1)}억 <span className="text-sm font-normal text-slate-500">원</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              잠재 매출: {(potentialRevenue / 10000).toLocaleString()}만
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-medium">
              <Briefcase size={14} className="text-indigo-500" />
              수주 성공률
            </div>
            <div className="text-lg font-bold text-slate-800">
              {totalProjects > 0 ? Math.round((contractedProjects.length / totalProjects) * 100) : 0}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              전체 {totalProjects}건 중 {contractedProjects.length}건 계약
            </div>
          </div>
        </div>

        {/* Payment Structure Analysis */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-500" />
            대금 수금 구조 (계약 확정 기준)
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {(() => {
              const totalDown = contractedProjects.reduce((sum, e) => sum + (e.downPayment || 0), 0);
              const totalProgress = contractedProjects.reduce((sum, e) => sum + (e.progressPayment || 0), 0);
              const totalBalance = contractedProjects.reduce((sum, e) => sum + (e.balancePayment || 0), 0);

              return (
                <>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">계약금 (선수금)</div>
                    <div className="font-bold text-slate-800">
                      {(totalDown / 10000).toLocaleString()}만
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">중도금 (진행)</div>
                    <div className="font-bold text-slate-800">
                      {(totalProgress / 10000).toLocaleString()}만
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">잔금 (미수금 예상)</div>
                    <div className="font-bold text-slate-800">
                      {(totalBalance / 10000).toLocaleString()}만
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-red-500" />
            월별 매출 추이
          </h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {monthlyData.map((m, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex items-end justify-center h-full bg-slate-50 rounded-t-lg overflow-hidden">
                  <div
                    className="w-full bg-blue-500 opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-t-lg relative"
                    style={{ height: `${(m.amount / maxMonthlyAmount) * 100}%` }}
                  >
                    {m.amount > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {(m.amount / 10000).toLocaleString()}만
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-green-500" />
            프로젝트 상태 분포
          </h3>
          <div className="flex items-center gap-4">
            {/* Simple Pie Chart Representation via Conic Gradient */}
            <div
              className="w-24 h-24 rounded-full flex-shrink-0 relative"
              style={{
                background: `conic-gradient(
                  #3b82f6 0% ${Math.round((contractedProjects.length / totalProjects) * 100)}%, 
                  #e2e8f0 ${Math.round((contractedProjects.length / totalProjects) * 100)}% 100%
                )`
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                Total {totalProjects}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">진행/완료 (계약)</span>
                  <span className="font-bold text-blue-600">{contractedProjects.length}건</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(contractedProjects.length / totalProjects) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">견적/협의 중</span>
                  <span className="font-bold text-slate-400">{negotiationProjects.length}건</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300" style={{ width: `${(negotiationProjects.length / totalProjects) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Contracts List */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users size={16} className="text-orange-500" />
              최근 계약 내역
            </h3>
            <button className="text-xs text-slate-400 hover:text-slate-600">더보기</button>
          </div>

          <div className="space-y-3">
            {recentContracts.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">최근 계약 내역이 없습니다.</div>
            ) : (
              recentContracts.map(project => (
                <div key={project.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {project.clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{project.clientName}</div>
                      <div className="text-[10px] text-slate-400">{project.siteAddress}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-700">{(project.totalAmount / 10000).toLocaleString()}만</div>
                    <div className="text-[10px] text-slate-400">{new Date(project.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
