import React, { useState, useEffect } from 'react';
import { ArrowLeft, Hammer, FileText, ChevronRight, Trash2, CheckCircle, Plus, X, Briefcase, Calendar, Clock, User, Pencil, Save } from 'lucide-react';
import { EstimatePreview } from './EstimatePreview';
import apiClient from '../../services/apiClient';
import { ConstructionStage } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface ConstructionDetailProps {
  project: any;
  onBack: () => void;
}

const ConstructionDetail: React.FC<ConstructionDetailProps> = ({ project, onBack }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'modeling' | 'contract'>('overview');
  const [overviewTab, setOverviewTab] = useState<'list' | 'chart'>('list');

  // Stage State
  const [stages, setStages] = useState<ConstructionStage[]>([]);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiSchedule, setAiSchedule] = useState<any[]>([]); // Store AI generated schedule
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<Partial<ConstructionStage>>({
    name: '',
    manager: '',
    duration: '',
    description: ''
  });

  // Fetch stages on load
  useEffect(() => {
    if (project?.id) {
      fetchStages();
    }
  }, [project?.id]);

  const fetchStages = async () => {
    try {
      const res = await apiClient.get(`/stages/${project.id}`);
      if (res.data.success) {
        setStages(res.data.stages);
      }
    } catch (error) {
      console.error('Failed to fetch stages:', error);
    }
  };

  const handleAiAnalysis = async () => {
    if (stages.length === 0) {
      alert('분석할 공사 단계가 없습니다. 먼저 단계를 추가해주세요.');
      return;
    }

    setIsGenerating(true);
    setAiSchedule([]); // Reset previous result
    try {
      const res = await apiClient.post('/ai/visualize-schedule', { stages });
      if (res.data.success) {
        setAiSchedule(res.data.schedule);
      } else {
        alert('일정 생성에 실패했습니다: ' + res.data.error);
      }
    } catch (error) {
      console.error('AI Schedule Error:', error);
      alert('AI 일정 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStage = async () => {
    if (!formData.name || !formData.manager) {
      alert('단계명과 담당직원은 필수입니다.');
      return;
    }

    try {
      if (editingId) {
        // Update existing stage
        const res = await apiClient.put(`/stages/${editingId}`, formData);
        if (res.data.success) {
          setStages(stages.map(s => s.id === editingId ? res.data.stage : s));
          setEditingId(null);
          setIsAddingStage(false);
          setFormData({ name: '', manager: '', duration: '', description: '' });
        }
      } else {
        // Create new stage
        const payload = { ...formData, projectId: project.id };
        const res = await apiClient.post('/stages', payload);
        if (res.data.success) {
          setStages([...stages, res.data.stage]);
          setIsAddingStage(false);
          setFormData({ name: '', manager: '', duration: '', description: '' });
        }
      }
    } catch (error) {
      console.error('Failed to save stage:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleStatusToggle = async (stage: ConstructionStage) => {
    const nextStatusMap: Record<string, string> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending'
    };
    const currentStatus = stage.status || 'pending';
    const nextStatus = nextStatusMap[currentStatus];

    try {
      const res = await apiClient.put(`/stages/${stage.id}`, { status: nextStatus });
      if (res.data.success) {
        setStages(stages.map(s => s.id === stage.id ? { ...s, status: nextStatus } : s));
      }
    } catch (error) {
      console.error('Status update failed:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleEditClick = (stage: ConstructionStage) => {
    setEditingId(stage.id);
    setFormData({
      name: stage.name,
      manager: stage.manager,
      duration: stage.duration,
      description: stage.description
    });
    setIsAddingStage(true); // Re-use the add form modal
  };

  const handleDeleteStage = async (id: string) => {
    if (!window.confirm('이 단계를 삭제하시겠습니까?')) return;
    try {
      const res = await apiClient.delete(`/stages/${id}`);
      if (res.data.success) {
        setStages(stages.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete stage:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setIsAddingStage(false);
    setEditingId(null);
    setFormData({ name: '', manager: '', duration: '', description: '' });
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
      try {
        const res = await apiClient.delete(`/estimates/${project.id}`);
        if (res.data.success) {
          alert('프로젝트가 삭제되었습니다.');
          onBack(); // Go back and refresh list
        } else {
          alert('삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('오류가 발생했습니다.');
      }
    }
  };

  if (showPreview) {
    return <EstimatePreview project={project} onBack={() => setShowPreview(false)} />;
  }

  const getProjectTitle = (address: string) => {
    if (!address) return '새 프로젝트';
    const parts = address.split(' ');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(' ') + ' 프로젝트';
    }
    return address + ' 프로젝트';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-slate-600 active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-800">
              {getProjectTitle(project.siteAddress)}
            </span>
            <span className="text-xs text-slate-500">시공 현황</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.href = `/?view=report&id=${project.id}`}
            className="p-2 text-slate-400 hover:text-blue-600 rounded-full transition-colors"
            title="종합 보고서 보기"
          >
            <FileText size={20} />
          </button>
          <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500 rounded-full">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 flex">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          개요
        </button>
        <button
          onClick={() => setActiveTab('modeling')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'modeling' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          모델링/도면
        </button>
        <button
          onClick={() => setActiveTab('contract')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'contract' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          계약서
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Overview Sub-tabs */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
              <button
                onClick={() => setOverviewTab('list')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${overviewTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
              >
                단계 목록
              </button>
              <button
                onClick={() => setOverviewTab('chart')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${overviewTab === 'chart' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
              >
                진행 시각화
              </button>
            </div>

            {/* Header / Add Button (Only show in list mode) */}
            {overviewTab === 'list' && (
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800">공사 단계 현황</h3>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', manager: '', duration: '', description: '' });
                    setIsAddingStage(true);
                  }}
                  className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                >
                  <Plus size={16} />
                  단계 추가
                </button>
              </div>
            )}

            {/* Stages List or Chart */}
            {overviewTab === 'list' ? (
              <div className="space-y-3">
                {stages.length === 0 && !isAddingStage ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Briefcase className="mx-auto text-slate-300 mb-2" size={32} />
                    <p className="text-slate-500 text-sm">등록된 공사 단계가 없습니다.</p>
                  </div>
                ) : (
                  stages.map((stage) => (
                    <div key={stage.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {stages.indexOf(stage) + 1}
                          </span>
                          <h4 className="font-bold text-slate-800">{stage.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusToggle(stage);
                            }}
                            className={`text-xs px-2 py-1 rounded-full transition-colors hover:opacity-80 ${stage.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                          >
                            {stage.status === 'pending' ? '대기중' : stage.status === 'in_progress' ? '진행중' : '완료'}
                          </button>

                          {/* Edit/Delete Buttons */}
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              onClick={() => handleEditClick(stage)}
                              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteStage(stage.id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          <span>{stage.manager}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400" />
                          <span>{stage.duration}</span>
                        </div>
                      </div>
                      {stage.description && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                          {stage.description}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // CHART VIEW
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">전체 공정 시각화</h3>
                  <button
                    onClick={handleAiAnalysis}
                    disabled={isGenerating || stages.length === 0}
                    className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✨</span>
                        AI 일정 분석
                      </>
                    )}
                  </button>
                </div>

                {stages.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    시각화할 데이터가 없습니다. 단계를 먼저 추가해주세요.
                  </div>
                ) : (
                  <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 my-4">
                    {(aiSchedule.length > 0 ? aiSchedule : stages).map((stage, index) => (
                      <div key={index} className="relative animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${index * 50}ms` }}>
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${stage.status === 'completed' ? 'bg-green-500' :
                          stage.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                          }`} />

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">STEP {index + 1}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${stage.status === 'completed' ? 'bg-green-100 text-green-700' :
                              stage.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                              }`}>
                              {stage.status === 'pending' ? '대기' : stage.status === 'in_progress' ? '진행' : '완료'}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-800">{stage.name}</h4>

                          {/* Display Date Range if AI generated */}
                          {stage.startDate && stage.endDate && (
                            <div className="flex items-center gap-2 mt-1 mb-1">
                              <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                {stage.startDate} ~ {stage.endDate}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              {stage.manager}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {stage.duration}
                            </div>
                          </div>

                          {stage.description && (
                            <p className="text-xs text-slate-400 mt-1 bg-slate-50 p-2 rounded">
                              {stage.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Stage Form */}
            {isAddingStage && (
              <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 fixed bottom-4 left-4 right-4 z-50 md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto shadow-2xl md:shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800">{editingId ? '단계 수정' : '새 단계 추가'}</h4>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">단계명 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      placeholder="예: 철거 공사"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">담당직원 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.manager}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        placeholder="이름 입력"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">소요기간</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        placeholder="예: 3일"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">상세설명</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
                      placeholder="작업 내용 상세 입력"
                    />
                  </div>

                  <button
                    onClick={handleSaveStage}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors mt-2"
                  >
                    {editingId ? '수정완료' : '추가하기'}
                  </button>
                </div>
              </div>
            )}


          </div>
        )}

        {activeTab === 'modeling' && (
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
        )}

        {activeTab === 'contract' && (
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
              <h2 className="text-xl font-bold text-slate-800 mb-2">계약이 완료된 프로젝트입니다</h2>
              <p className="text-slate-500 text-sm mb-6">
                계약 일자: {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <div className="bg-slate-50 p-4 rounded-lg text-left text-sm space-y-2">
                <div className="flex justified-between">
                  <span className="text-slate-500">고객명</span>
                  <span className="font-medium ml-auto">{project.clientName}</span>
                </div>
                <div className="flex justified-between">
                  <span className="text-slate-500">총 공사금액</span>
                  <span className="font-bold text-blue-600 ml-auto">
                    {project.totalAmount?.toLocaleString()} 원
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionDetail;
