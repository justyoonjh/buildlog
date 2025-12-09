import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Image, X } from 'lucide-react';

interface StepModelProps {
  modelImage: string | null;
  generatedImage: string | null;
  styleDescription: string;
  onImageChange: (url: string | null) => void;
  onGeneratedImageChange: (url: string | null) => void;
  onStyleChange: (desc: string) => void;
}

export const StepModel: React.FC<StepModelProps> = ({
  modelImage,
  generatedImage,
  styleDescription,
  onImageChange,
  onGeneratedImageChange,
  onStyleChange,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageChange(base64String);
        onGeneratedImageChange(null); // Reset generated image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (!modelImage) return;

    setIsGenerating(true);
    // Mock AI Generation delay
    setTimeout(() => {
      setIsGenerating(false);
      // For demo, we just use the same image but in a "Success" state
      // In real app, this would be the result from API
      onGeneratedImageChange(modelImage);
      alert('AI가 시공 이미지를 생성했습니다! (데모)');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <div className="flex items-center gap-2 font-bold mb-1">
          <Sparkles size={16} className="text-blue-600" />
          AI 시공 예측
        </div>
        현장 사진을 올리면 AI가 시공 후 모습을 미리 보여줍니다.
      </div>

      {/* 1. Upload Section */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">현장 사진 업로드</label>

        {!modelImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors"
          >
            <Camera size={48} className="text-slate-300 mb-3" />
            <span className="text-slate-500 font-medium">터치하여 사진 촬영 또는 선택</span>
            <span className="text-xs text-slate-400 mt-1">JPG, PNG 파일 지원</span>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-200">
            <img src={modelImage} alt="Site Preview" className="w-full h-64 object-cover" />
            <button
              onClick={() => {
                onImageChange(null);
                onGeneratedImageChange(null);
              }}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
              원본 이미지
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 2. Style Input */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">원하는 스타일 요청</label>
        <textarea
          value={styleDescription}
          onChange={(e) => onStyleChange(e.target.value)}
          placeholder="예: 전체적으로 화이트 톤으로 깔끔하게, 바닥은 우드 톤으로 해주세요."
          className="w-full p-4 border border-slate-200 rounded-xl h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-base"
        />
      </div>

      {/* Generate Action */}
      <button
        onClick={handleGenerate}
        disabled={!modelImage || isGenerating}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
          ${!modelImage || isGenerating
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg active:scale-95'
          }
        `}
      >
        {isGenerating ? (
          <>
            <Sparkles className="animate-spin" size={20} />
            AI가 이미지를 생성 중입니다...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            AI 시공 이미지 생성하기
          </>
        )}
      </button>

      {/* Generated Result */}
      {generatedImage && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 mb-3 mt-8">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">AI 시공 예측 결과</h3>
              <p className="text-xs text-slate-500">요청하신 스타일이 반영된 이미지입니다.</p>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-blue-100">
            <img src={generatedImage} alt="AI Generated" className="w-full h-auto" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-4">
              <button className="bg-white text-slate-900 font-bold px-4 py-2 rounded-lg text-sm shadow-lg transform translate-y-2 hover:translate-y-0 transition-transform">
                크게 보기
              </button>
            </div>
            <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
              AI GENERATED
            </div>
          </div>

          <div className="mt-4 bg-slate-50 p-4 rounded-xl text-xs text-slate-500 text-center">
            * AI 예측 이미지는 실제 시공 결과와 다를 수 있으며, 참고용으로만 활용해 주세요.
          </div>
        </div>
      )}
    </div>
  );
};
