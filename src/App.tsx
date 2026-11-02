import { useUiStore } from '@/stores/uiStore';
import { APP_MODULES } from '@/types/domain/module';
import ModulePlaceholder from '@/components/common/ModulePlaceholder';

/**
 * Shell de la aplicación (v1): una sola página con navegación por pestañas,
 * sin React Router. La identidad visual congelada del Header se implementa
 * en Fase 1; este shell establece la estructura funcional.
 */
export default function App() {
  const activeModule = useUiStore((state) => state.activeModule);
  const setActiveModule = useUiStore((state) => state.setActiveModule);

  const active = APP_MODULES.find((module) => module.id === activeModule) ?? APP_MODULES[0];

  return (
    <div className="min-h-dvh bg-[#060b13] text-slate-100">
      <header className="border-b border-slate-800 bg-[#070e1a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-amber-400">
              PROMETHEUS IGNIS
            </span>
            <span className="rounded-full border border-cyan-500/40 px-2 py-0.5 text-xs font-medium text-cyan-300">
              MODIS · VIIRS
            </span>
          </div>
          <nav aria-label="Módulos" className="flex flex-wrap gap-1" role="tablist">
            {APP_MODULES.map((module) => {
              const isActive = module.id === activeModule;
              return (
                <button
                  key={module.id}
                  type="button"
                  id={`tab-${module.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${module.id}`}
                  onClick={() => setActiveModule(module.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-amber-300'
                  }`}
                >
                  {module.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div
          key={active.id}
          id={`panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${active.id}`}
          tabIndex={0}
        >
          <ModulePlaceholder title={active.label} description={active.description} />
        </div>
      </main>
    </div>
  );
}
