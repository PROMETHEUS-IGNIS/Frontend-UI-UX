import { Activity, BookOpen, Cpu, Download, Layers, Sparkles } from 'lucide-react';

import type { AppModuleId } from '@/types/domain/module';
import { APP_MODULES } from '@/types/domain/module';
import ConnectionIndicator from './ConnectionIndicator';
import logoPng from '@/assets/PROMETHEUS_IGNIS.png';

interface HeaderProps {
  activeModule: AppModuleId;
  onModuleChange: (moduleId: AppModuleId) => void;
  /** Número de registros visibles tras los filtros (export CSV). */
  totalVisibleCount: number;
  onExportCsv: () => void;
  onOpenGlossary: () => void;
}

const MODULE_ICONS: Record<AppModuleId, typeof Layers> = {
  explorer: Layers,
  analytics: Activity,
  comparison: Sparkles,
  laboratory: Cpu,
};

const MOBILE_MODULE_LABELS: Record<AppModuleId, string> = {
  explorer: 'Mapa',
  analytics: 'Analítica',
  comparison: 'Matriz 5×5',
  laboratory: 'Modelos IA',
};

/**
 * Cabecera congelada de la interfaz (plantilla `../prometheus-ignis`):
 * logo institucional, navegación por pestañas (escritorio + móvil),
 * indicador pasivo de conexión, glosario y exportación CSV.
 * Sin pestaña FastAPI Lab y sin conmutador Demostración/Lab Real (fuera de alcance).
 */
export default function Header({
  activeModule,
  onModuleChange,
  totalVisibleCount,
  onExportCsv,
  onOpenGlossary,
}: HeaderProps) {
  const canExport = totalVisibleCount > 0;
  const exportTitle = canExport
    ? `Exportar ${totalVisibleCount} registros filtrados a CSV`
    : 'Sin registros visibles para exportar (requiere conexión con el backend)';

  return (
    <header className="border-b border-slate-800/80 bg-[#070e1a]/90 backdrop-blur-md sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10">
              <img
                src={logoPng}
                alt=""
                className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-orange-500/20 ring-1 ring-white/20"
              />
              <div
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-[#070e1a]"
                title="Armonización MODIS + VIIRS"
                aria-hidden
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base sm:text-lg bg-gradient-to-r from-amber-200 via-orange-300 to-amber-500 bg-clip-text text-transparent font-mono whitespace-nowrap">
                  PROMETHEUS IGNIS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono whitespace-nowrap">
                  MODIS · VIIRS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Plataforma de Inteligencia Territorial ·{' '}
                <span className="text-slate-300">Semillero de Astronomía ITM</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs (desktop) */}
          <nav
            aria-label="Módulos"
            role="tablist"
            className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800"
          >
            {renderDesktopTabs()}
          </nav>

          {/* Right Controls: connection status & actions */}
          <div className="flex items-center gap-2">
            <ConnectionIndicator />

            {/* Glossary Button */}
            <button
              type="button"
              onClick={onOpenGlossary}
              title="Glosario Científico de Términos (FIRMS, FRP, Píxel, Recurrencia)"
              aria-label="Abrir glosario científico"
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-amber-300 hover:border-slate-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            >
              <BookOpen className="w-4 h-4" aria-hidden />
            </button>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={onExportCsv}
              disabled={!canExport}
              title={exportTitle}
              aria-label={exportTitle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" aria-hidden />
              <span className="hidden sm:inline">CSV ({totalVisibleCount})</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 text-xs">
          {renderMobileTabs()}
        </div>
      </div>
    </header>
  );

  function renderDesktopTabs() {
    return APP_MODULES.map((module) => {
      const Icon = MODULE_ICONS[module.id];
      const isActive = module.id === activeModule;
      return (
        <button
          key={module.id}
          type="button"
          role="tab"
          id={`tab-${module.id}-desktop`}
          aria-selected={isActive}
          aria-controls={`panel-${module.id}`}
          onClick={() => onModuleChange(module.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
            isActive
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden />
          <span>{module.label}</span>
        </button>
      );
    });
  }

  function renderMobileTabs() {
    return APP_MODULES.map((module) => {
      const isActive = module.id === activeModule;
      return (
        <button
          key={`mobile-${module.id}`}
          type="button"
          role="tab"
          id={`tab-${module.id}-mobile`}
          aria-selected={isActive}
          aria-controls={`panel-${module.id}`}
          onClick={() => onModuleChange(module.id)}
          className={`px-2 py-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
            isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          {MOBILE_MODULE_LABELS[module.id]}
        </button>
      );
    });
  }
}
