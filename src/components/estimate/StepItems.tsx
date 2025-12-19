import React, { useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface EstimateItem {
  id: number;
  category: string;
  description: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

interface StepItemsProps {
  items: EstimateItem[];
  onItemsChange: (items: EstimateItem[]) => void;
  vatIncluded: boolean;
  onVatChange: (included: boolean) => void;
}

export const StepItems: React.FC<StepItemsProps> = ({ items, onItemsChange, vatIncluded, onVatChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when adding item
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items.length]);

  const handleAddItem = () => {
    const newItem: EstimateItem = {
      id: Date.now(), // Temporary ID
      category: '기타',
      description: '',
      spec: '',
      quantity: 1,
      unit: '식',
      unitPrice: 0,
      amount: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: number, field: keyof EstimateItem, value: any) => {
    onItemsChange(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Auto-calculate amount
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const parseNumber = (str: string) => parseInt(str.replace(/,/g, ''), 10) || 0;

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-4 px-1">
        <label className="text-sm font-bold text-slate-700">견적 상세 품목</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">부가세 포함</span>
          <div
            onClick={() => onVatChange(!vatIncluded)}
            className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${vatIncluded ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${vatIncluded ? 'translate-x-5' : ''}`} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 space-y-4" ref={scrollRef}>
        {items.map((item, index) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1"
            >
              <Trash2 size={18} />
            </button>

            <div className="grid grid-cols-1 gap-3">
              {/* Row 1: Category & Description */}
              <div className="flex gap-2">
                <select
                  value={item.category}
                  onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                  className="w-24 h-9 border border-slate-200 rounded-lg text-xs px-1 bg-slate-50 outline-none"
                >
                  <option value="기타">기타</option>
                  <option value="철거">철거</option>
                  <option value="설비">설비</option>
                  <option value="목공">목공</option>
                  <option value="전기">전기</option>
                  <option value="타일">타일</option>
                  <option value="도장">도장</option>
                  <option value="도배">도배</option>
                  <option value="바닥">바닥</option>
                  <option value="가구">가구</option>
                </select>
                <input
                  type="text"
                  placeholder="품목명 (예: 싱크대 철거)"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  className="flex-1 font-medium text-slate-800 placeholder:text-slate-300 outline-none border-b border-dashed border-slate-300 focus:border-blue-500 py-1"
                />
              </div>

              {/* Row 2: Spec (Tip) */}
              <div className="flex">
                <input
                  type="text"
                  placeholder="상세 스펙 (브랜드, 규격 등)"
                  value={item.spec}
                  onChange={(e) => handleUpdateItem(item.id, 'spec', e.target.value)}
                  className="w-full text-xs text-slate-500 placeholder:text-slate-300 bg-slate-50 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Row 3: Qty, Unit, Price, Amount */}
              <div className="flex flex-wrap items-end gap-3 mt-1">
                {/* Quantity */}
                <div className="flex flex-col w-20">
                  <label className="text-[10px] text-slate-400 mb-0.5">수량</label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-9">
                    <button
                      onClick={() => handleUpdateItem(item.id, 'quantity', Math.max(0, item.quantity - 1))}
                      className="w-6 h-full bg-slate-50 flex items-center justify-center active:bg-slate-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value))}
                      className="w-full h-full text-center text-sm font-bold outline-none no-spin"
                    />
                    <button
                      onClick={() => handleUpdateItem(item.id, 'quantity', item.quantity + 1)}
                      className="w-6 h-full bg-slate-50 flex items-center justify-center active:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Unit */}
                <div className="flex flex-col w-16">
                  <label className="text-[10px] text-slate-400 mb-0.5">단위</label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                    className="h-9 w-full border border-slate-200 rounded-lg text-xs px-1 bg-white outline-none"
                  >
                    <option value="식">식</option>
                    <option value="개">개</option>
                    <option value="m">m</option>
                    <option value="평">평</option>
                    <option value="회">회</option>
                  </select>
                </div>

                {/* Unit Price */}
                <div className="flex-1 min-w-[100px]">
                  <label className="text-[10px] text-slate-400 mb-0.5">단가 (원)</label>
                  <input
                    type="text"
                    value={item.unitPrice === 0 ? '' : formatNumber(item.unitPrice)}
                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseNumber(e.target.value))}
                    className="w-full h-9 border border-slate-200 rounded-lg px-3 text-right text-sm font-medium outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Total Row */}
              <div className="flex justify-end items-center pt-2 mt-1 border-t border-slate-100">
                <span className="text-xs text-slate-400 mr-2">합계</span>
                <span className="text-lg font-bold text-blue-600">{formatNumber(item.amount)}</span>
                <span className="text-xs text-slate-500 ml-1">원</span>
              </div>
            </div>
          </div>
        ))}

        {/* Floating Add Button Wrapper */}
        <div className="sticky bottom-4 left-0 right-0 flex justify-center z-10 p-4 pointer-events-none">
          <button
            onClick={handleAddItem}
            className="pointer-events-auto bg-slate-900 text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 hover:bg-slate-800 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span className="font-bold">품목 추가하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
