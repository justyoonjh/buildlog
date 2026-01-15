import { renderHook, act, waitFor } from '@testing-library/react';
import { useEstimateFormLogic } from '@/features/project/hooks/useEstimateFormLogic';
import apiClient from '@/services/apiClient';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('../../services/apiClient');
jest.mock('react-hot-toast');

describe('useEstimateFormLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for apiClient
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { success: true, estimate: { id: '123' } } });
    (apiClient.put as jest.Mock).mockResolvedValue({ data: { success: true, estimate: { id: '123' } } });
  });

  it('should initialize with default step 1', () => {
    const { result } = renderHook(() => useEstimateFormLogic({
      onComplete: jest.fn(),
      onBack: jest.fn()
    }));

    expect(result.current.currentStep).toBe(1);
    expect(result.current.formData.clientName).toBe('');
  });

  it('should validate clientName on save', async () => {
    const { result } = renderHook(() => useEstimateFormLogic({
      onComplete: jest.fn(),
      onBack: jest.fn()
    }));

    // Trigger save without client name
    await act(async () => {
      await result.current.handleSaveNegotiating();
    });

    expect(toast.error).toHaveBeenCalledWith('고객명을 입력해주세요.');
  });

  it('should save estimate successfully', async () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useEstimateFormLogic({
      onComplete,
      onBack: jest.fn()
    }));

    // update client name
    act(() => {
      result.current.updateField('clientName', 'Test Client');
    });

    // Trigger save
    await act(async () => {
      await result.current.handleSaveNegotiating();
    });

    expect(apiClient.post).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('저장되었습니다'));
    expect(onComplete).toHaveBeenCalled();
  });
});
