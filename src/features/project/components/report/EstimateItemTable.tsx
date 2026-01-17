import React from 'react';
import { FileText } from 'lucide-react';

interface EstimateItemTableProps {
  items: any[];
  totalAmount: number;
}

export const EstimateItemTable: React.FC<EstimateItemTableProps> = ({ items, totalAmount }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 print:shadow-none print:border print:border-slate-300 print:break-inside-avoid">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
        <FileText size={18} /> 주요 견적 품목
      </h3>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium">
          <tr>
            <th className="px-3 py-2 rounded-l-lg">품목명</th>
            <th className="px-3 py-2">규격</th>
            <th className="px-3 py-2 text-right">수량</th>
            <th className="px-3 py-2 text-right rounded-r-lg">금액</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items && items.map((item: any, idx: number) => (
            <tr key={idx}>
              <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
              <td className="px-3 py-2 text-slate-500">{item.spec}</td>
              <td className="px-3 py-2 text-right text-slate-600">{item.quantity} {item.unit}</td>
              <td className="px-3 py-2 text-right font-medium text-slate-800">{item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-slate-200">
          <tr>
            <td colSpan={3} className="px-3 py-4 text-right font-bold text-slate-800">합계</td>
            <td className="px-3 py-4 text-right font-bold text-blue-600 text-lg">
              {totalAmount?.toLocaleString()} 원
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
