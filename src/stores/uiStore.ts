import { create } from 'zustand';

import type { AppModuleId } from '@/types/domain/module';

/**
 * Estado global de interfaz compartido entre módulos.
 * Reglas repo: aquí NO vive estado remoto (ese es de TanStack Query) ni
 * estado efímero local de un componente.
 */
interface UiState {
  /** Pestaña activa de la sesión (navegación sin router, v1). */
  activeModule: AppModuleId;
  setActiveModule: (moduleId: AppModuleId) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  activeModule: 'explorer',
  setActiveModule: (moduleId) => set({ activeModule: moduleId }),
}));
