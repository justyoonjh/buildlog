import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import toast from 'react-hot-toast';
import { ROLES, STATUS } from '@/shared/constants/auth';

export const useCompanyMembers = () => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!user?.companyCode) return;

    setIsLoading(true);
    try {
      const data = await authService.getCompanyMembers(user.companyCode);
      setMembers(data);
    } catch (err) {
      console.error(err);
      toast.error('직원 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyCode]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const approveUser = async (userId: string) => {
    if (!confirm('해당 직원의 가입을 승인하시겠습니까?')) return;
    try {
      await authService.approveUser(userId);
      toast.success('승인되었습니다.');
      fetchMembers();
    } catch (err) {
      console.error(err);
      toast.error('승인 처리에 실패했습니다.');
    }
  };

  const rejectUser = async (userId: string) => {
    if (!confirm('해당 직원의 가입을 거절하시겠습니까?')) return;
    try {
      await authService.rejectUser(userId);
      toast.success('거절되었습니다.');
      fetchMembers();
    } catch (err) {
      console.error(err);
      toast.error('거절 처리에 실패했습니다.');
    }
  };

  const boss = members.find(m => m.role === ROLES.BOSS) || user;
  // Filter logic
  const approvedMembers = members.filter(m => m.role !== ROLES.BOSS && m.status !== STATUS.PENDING && m.status !== STATUS.REJECTED);
  const pendingMembers = members.filter(m => m.status === STATUS.PENDING);

  return {
    members,
    boss,
    approvedMembers,
    pendingMembers,
    approveUser,
    rejectUser,
    isLoading,
    refresh: fetchMembers
  };
};
