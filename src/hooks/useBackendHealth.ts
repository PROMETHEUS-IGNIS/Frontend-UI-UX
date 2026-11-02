import { useQuery } from '@tanstack/react-query';

import { checkBackendHealth, type BackendHealthResult } from '@/services/api/healthService';

/**
 * Hook de estado de servidor para el indicador pasivo de conexión del Header.
 * Estado remoto exclusivo de TanStack Query (no se duplica en Zustand).
 */
export const BACKEND_HEALTH_QUERY_KEY = ['backend-health'] as const;

export type ConnectionOutcome = 'checking' | 'connected' | 'unavailable';

export function useBackendHealth(): {
  outcome: ConnectionOutcome;
  checkNow: () => void;
} {
  const healthQuery = useQuery({
    queryKey: BACKEND_HEALTH_QUERY_KEY,
    queryFn: checkBackendHealth,
    retry: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
  });

  const outcome: ConnectionOutcome = healthQuery.isPending
    ? 'checking'
    : healthQuery.isError
      ? 'unavailable'
      : describeResult(healthQuery.data);

  return { outcome, checkNow: () => void healthQuery.refetch() };
}

function describeResult(result: BackendHealthResult | undefined): ConnectionOutcome {
  if (!result) {
    return 'unavailable';
  }
  return result.connected ? 'connected' : 'unavailable';
}

