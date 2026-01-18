import React from 'react';
import { Estimate } from '@/types';

interface ReportContractSectionProps {
  project: Estimate;
  user?: any; // User type
}

export const ReportContractSection: React.FC<ReportContractSectionProps> = ({ project, user }) => {
  const formatNumber = (num: number) => num ? num.toLocaleString() : '0';

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Fallback if payment terms are not saved (should be saved in project, but assuming standard 10/40/50 if missing)
  const downName = project.downPayment || Math.round((project.totalAmount || 0) * 0.1);
  const progressName = project.progressPayment || Math.round((project.totalAmount || 0) * 0.4);
  const balanceName = project.balancePayment || ((project.totalAmount || 0) - downName - progressName);

  // Contractor Info (Eul) - Use logged in user info
  const contractorName = user?.companyName || user?.name || '(주)빌드로그';
  const contractorOwner = user?.ownerName || user?.name || '김대표';
  const contractorAddress = user?.businessAddress || '서울시 강남구 ...';

  const contractContent = `
제 1 조 (목적)
본 계약은 "시공사(이하 '을')"가 "발주자(이하 '갑')"로부터 위탁받은 인테리어 공사를 성실하게 수행하고, "갑"은 이에 대한 대금을 지급함에 있어 필요한 제반 사항을 규정함을 목적으로 한다.

제 2 조 (공사 개요)
1. 공사명 : ${project.siteAddress} 인테리어 공사
2. 현장주소 : ${project.siteAddress}
3. 공사기간 : ${project.startDate || '미정'} 부터 ${project.endDate || '미정'} 까지
4. 도급금액 : 일금 ${formatNumber(project.totalAmount || 0)}원정 (${project.vatIncluded ? '부가세 포함' : '부가세 별도'})

제 3 조 (대금 지급)
1. 계약금 (착수 시) : 일금 ${formatNumber(downName)}원
2. 중도금 (공사 진행 중) : 일금 ${formatNumber(progressName)}원
3. 잔금 (공사 완료 시) : 일금 ${formatNumber(balanceName)}원

제 4 조 (공사의 변경)
"갑"의 요청에 의해 공사 내용이 변경되거나 추가될 경우, "갑"과 "을"은 협의하여 공사비와 공사기간을 조정할 수 있다.

제 5 조 (하자 보수)
공사 완료 후 1년 이내에 시공상의 중대한 하자가 발생한 경우 "을"은 무상으로 보수할 책임을 진다. 단, "갑"의 과실로 인한 경우는 제외한다.
  `;

  return (
    <div className="bg-white border border-slate-300 shadow-sm p-8 min-h-[500px] text-slate-800 break-inside-avoid">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-800 pb-2">공사 도급 계약서</h2>

      {/* Gap/Eul Info Table */}
      <table className="w-full border-collapse border border-slate-400 mb-8 text-sm">
        <tbody>
          <tr>
            <th className="border border-slate-400 bg-slate-100 p-2 w-24">도급인 (갑)</th>
            <td className="border border-slate-400 p-2">
              <div>성명: {project.clientName}</div>
              <div>연락처: {project.clientPhone}</div>
            </td>
          </tr>
          <tr>
            <th className="border border-slate-400 bg-slate-100 p-2">수급인 (을)</th>
            <td className="border border-slate-400 p-2">
              <div>상호: {contractorName}</div>
              <div>대표: {contractorOwner}</div>
              <div>주소: {contractorAddress}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Contract Body */}
      <div className="whitespace-pre-wrap mb-8 font-serif text-sm leading-relaxed text-slate-700">
        {contractContent}
      </div>

      {/* Signatures */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="text-center font-bold mb-8">{today}</div>
        <div className="flex justify-around text-center">
          <div className="space-y-4">
            <div className="text-sm">도급인 (갑)</div>
            <div className="text-lg font-serif border-b border-slate-400 pb-1 px-4">{project.clientName} (인)</div>
          </div>
          <div className="space-y-4">
            <div className="text-sm">수급인 (을)</div>
            <div className="text-lg font-serif border-b border-slate-400 pb-1 px-4">{contractorName} {contractorOwner} (인)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
