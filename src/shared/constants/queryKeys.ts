export const QUERY_KEYS = {
  estimates: {
    all: ['estimates'] as const,
    detail: (id: string) => ['estimates', id] as const,
  },
  stages: {
    all: ['stages'] as const,
    byProject: (projectId: string) => ['stages', projectId] as const,
  },
  user: {
    profile: ['user', 'profile'] as const,
  },
};
