import { useBackendHealth, type ConnectionOutcome } from '@/hooks/useBackendHealth';

const STATE_LABELS: Record<ConnectionOutcome, string> = {
  checking: 'Comprobando backend…',
  connected: 'Backend Conectado',
  unavailable: 'Backend No disponible',
};

const DOT_CLASSES: Record<ConnectionOutcome, string> = {
  checking: 'bg-amber-400 animate-pulse',
  connected: 'bg-emerald-400 animate-ping',
  unavailable: 'bg-slate-500',
};

const BUTTON_CLASSES: Record<ConnectionOutcome, string> = {
  checking: 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-500',
  connected:
    'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40',
  unavailable: 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-500',
};

/**
 * Píldora pasiva de conexión del Header congelado (sin panel de
 * configuración de URL). El clic fuerza una comprobación manual del estado.
 */
export default function ConnectionIndicator() {
  const { outcome, checkNow } = useBackendHealth();

  return (
    <button
      type="button"
      onClick={checkNow}
      title={STATE_LABELS[outcome]}
      aria-label={`Estado de conexión con el backend: ${STATE_LABELS[outcome]}. Pulsa para comprobar de nuevo.`}
      className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] border font-mono transition-colors ${BUTTON_CLASSES[outcome]}`}
    >
      <span className={`w-2 h-2 rounded-full ${DOT_CLASSES[outcome]}`} aria-hidden />
      <span>{outcome === 'checking' ? 'Conectando…' : STATE_LABELS[outcome]}</span>
    </button>
  );
}
