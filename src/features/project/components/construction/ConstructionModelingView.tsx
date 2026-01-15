import React from 'react';

interface ConstructionModelingViewProps {
  project: any;
}

export const ConstructionModelingView: React.FC<ConstructionModelingViewProps> = ({ project }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full" />
          생성된 AI 모델링
        </h3>
        {project.generatedImage || project.modelImage ? (
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <img
              src={project.generatedImage || project.modelImage}
              alt="모델링 이미지"
              className="w-full h-auto object-cover"
            />
          </div>
        ) : (
          <div className="h-40 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200">
            등록된 모델링 이미지가 없습니다.
          </div>
        )}
        {project.styleDescription && (
          <div className="mt-4 bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
            <p className="text-xs text-slate-400 mb-1">요청 스타일</p>
            {project.styleDescription}
          </div>
        )}
      </div>
    </div>
  );
};
