import { useState } from 'react';

import GlossaryModal from '@/components/common/GlossaryModal';
import ModulePlaceholder from '@/components/common/ModulePlaceholder';
import Header from '@/components/layout/Header';
import { useUiStore } from '@/stores/uiStore';
import { APP_MODULES } from '@/types/domain/module';

/**
 * Shell de la aplicación (v1): una sola página con navegación por pestañas,
 * sin React Router. Los filtros compartidos y la selección de observación
 * entran en uiStore a partir de la Fase 3.
 */
export default function App() {
  const activeModule = useUiStore((state) => state.activeModule);
  const setActiveModule = useUiStore((state) => state.setActiveModule);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  // Fase 2/4: el conjunto filtrado del backend alimentará este contador y
  // la generación real del CSV.
  const totalVisibleCount = 0;

  const active = APP_MODULES.find((module) => module.id === activeModule) ?? APP_MODULES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#060b13] text-slate-100 font-sans">
      <Header
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        totalVisibleCount={totalVisibleCount}
        onExportCsv={() => undefined}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div
          key={active.id}
          id={`panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${active.id}-desktop`}
          tabIndex={0}
          className="flex-1 flex flex-col overflow-y-auto"
        >
          <div className="mx-auto max-w-7xl p-6">
            <ModulePlaceholder title={active.label} description={active.description} />
          </div>
        </div>
      </main>

      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
}
