import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente de servidor compartido por toda la sesión (los 4 módulos consumen
 * el mismo pool). Convenciones repo:
 * - state remoto exclusivo de TanStack Query (Zustand solo guarda estado de UI).
 * - Refetch manual controlado por la UI; sin refetch agresivo en focus.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
