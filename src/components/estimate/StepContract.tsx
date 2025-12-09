import React, { useState } from 'react';
import { FileSignature, CheckCircle, AlertCircle } from 'lucide-react';

interface StepContractProps {
  data: {
    clientName: string;
    clientPhone: string;
    siteAddress: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    vatIncluded: boolean;
    items: any[];
  };
  onSignChange: (signed: boolean) => void;
}

export const StepContract: React.FC<StepContractProps> = ({ data, onSignChange }) => {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = (checked: boolean) => {
    setAgreed(checked);
    onSignChange(checked);
  };

  const formatNumber = (num: number) => num.toLocaleString();

  // Calculate generic terms
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Terms
  const contractContent = `
제 1 조 (목적)
본 계약은 "시공사(이하 '을')"가 "발주자(이하 '갑')"로부터 위탁받은 인테리어 공사를 성실하게 수행하고, "갑"은 이에 대한 대금을 지급함에 있어 필요한 제반 사항을 규정함을 목적으로 한다.

제 2 조 (공사 개요)
1. 공사명 : ${data.siteAddress} 인테리어 공사
2. 현장주소 : ${data.siteAddress}
3. 공사기간 : ${data.startDate || '미정'} 부터 ${data.endDate || '미정'} 까지
4. 도급금액 : 일금 ${formatNumber(data.totalAmount)}원정 (${data.vatIncluded ? '부가세 포함' : '부가세 별도'})

제 3 조 (대금 지급)
1. 계약금 : 착수 시 도급금액의 10%
2. 중도금 : 공사 50% 진행 시 도급금액의 40%
3. 잔금 : 공사 완료 및 검수 후 50%

제 4 조 (공사의 변경)
"갑"의 요청에 의해 공사 내용이 변경되거나 추가될 경우, "갑"과 "을"은 협의하여 공사비와 공사기간을 조정할 수 있다.

제 5 조 (하자 보수)
공사 완료 후 1년 이내에 시공상의 중대한 하자가 발생한 경우 "을"은 무상으로 보수할 책임을 진다. 단, "갑"의 과실로 인한 경우는 제외한다.
  `;

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
        <div className="flex items-center gap-2 font-bold mb-1">
          <FileSignature size={16} className="text-orange-600" />
          표준 공사 계약서 검토
        </div>
        작성된 견적 내용을 바탕으로 생성된 계약서입니다. 내용을 확인 후 서명해 주세요.
      </div>

      {/* Contract Paper UI */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-none p-6 min-h-[500px] text-slate-800 font-serif leading-relaxed text-sm">
        <h2 className="text-xl font-bold text-center mb-8 border-b-2 border-slate-800 pb-4">표준 인테리어 공사 계약서</h2>

        {/* Gap/Eul Info Table */}
        <table className="w-full border-collapse border border-slate-400 mb-8 text-xs">
          <tbody>
            <tr>
              <th className="border border-slate-400 bg-slate-100 p-2 w-20">도급인 (갑)</th>
              <td className="border border-slate-400 p-2">
                <div>성명: {data.clientName}</div>
                <div>연락처: {data.clientPhone}</div>
              </td>
            </tr>
            <tr>
              <th className="border border-slate-400 bg-slate-100 p-2">수급인 (을)</th>
              <td className="border border-slate-400 p-2">
                <div>상호: (주)빌드로그</div>
                <div>대표: 김대표</div>
                <div>주소: 서울시 강남구 테헤란로 123</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Contract Body */}
        <div className="whitespace-pre-wrap mb-8 font-sans text-sm text-slate-700">
          {contractContent}
        </div>

        {/* Date & Sign */}
        <div className="mt-12 text-center font-bold">
          <div className="mb-8">{today}</div>
          <div className="flex justify-around">
            <div className="flex flex-col gap-10">
              <div>"갑" (서명/인)</div>
            </div>
            <div className="flex flex-col gap-10">
              <div>"을" (서명/인)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div
        onClick={() => handleAgree(!agreed)}
        className={`
          flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer select-none
          ${agreed
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
          }
        `}
      >
        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
          ${agreed ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'}
        `}>
          {agreed && <CheckCircle size={16} />}
        </div>
        <span className="font-bold text-sm">
          위 계약 내용을 모두 확인하였으며, 이에 동의합니다.
        </span>
      </div>
    </div>
  );
};
