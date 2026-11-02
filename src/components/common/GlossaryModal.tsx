import { useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Contenido canónico de la plantilla congelada (`GlossaryModal.tsx`):
 * los 7 términos y sus fuentes no se reescriben. Se añaden atributos de
 * accesibilidad (dialog/aria) y cierre con Escape que no alteran lo visible.
 */
const TERMS = [
  {
    term: 'Foco de Calor (Anomalía Térmica)',
    definition:
      'Señal registrada por el sensor satelital donde la radiación infrarroja media emitida por un píxel supera el fondo circundante. No equivale necesariamente a un incendio forestal único o fuera de control: un píxel puede contener una quema agrícola controlada, actividad minera o fuego de menor fracción de área.',
  },
  {
    term: 'MODIS vs VIIRS (Resolución Espacial)',
    definition:
      'MODIS opera con una resolución nominal de ~1 km en el nadir (sensores Terra y Aqua). VIIRS opera a ~375 m en bandas infrarrojas de imagen I (Suomi-NPP, NOAA-20 y NOAA-21). Debido a su mayor resolución, VIIRS detecta fuegos de menor intensidad y superficie, produciendo mayor volumen de registros.',
  },
  {
    term: 'Potencia Radiativa del Fuego (FRP - Fire Radiative Power)',
    definition:
      'Medida en Megavatios (MW) que cuantifica la tasa de liberación de energía térmica radiante liberada por la combustión en el momento del pase orbital. Está directamente relacionada con la tasa de consumo de biomasa.',
  },
  {
    term: 'Confianza de Detección FIRMS',
    definition:
      'Expresa la certeza algorítmica de que la anomalía térmica sea un fuego real y no un falso positivo por reflexión solar o contraste superficial. VIIRS reporta clases categóricas (Low, Nominal, High), mientras MODIS reporta un valor de 0 a 100.',
  },
  {
    term: 'Recurrencia Histórica (0–100)',
    definition:
      'Métrica sintética que resume la persistencia y repetición espacial y temporal de observaciones a lo largo de los años. No constituye un pronóstico ni una probabilidad de incendio futuro, sino una medida del registro acumulado en el territorio.',
  },
  {
    term: 'Amenaza vs Exposición vs Vulnerabilidad',
    definition:
      'Marco de gestión del riesgo de la UNDRR (2015). La Amenaza corresponde a la actividad histórica observada; la Exposición identifica los elementos humanos y naturales presentes (hospitales, poblados, reservas); y la Vulnerabilidad describe su susceptibilidad intrínseca ante el daño.',
  },
  {
    term: 'Matriz de Riesgo Territorial 5×5',
    definition:
      'Esquema ordinal conceptual (P = Amenaza × Consecuencia) con puntajes de 1 a 25 para priorizar sectores de intervención territorial y medidas preventivas de planificación, sin constituir un modelo predictivo.',
  },
] as const;

export default function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-modal-title"
        aria-describedby="glossary-modal-subtitle"
        className="bg-[#070e1a] border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#091424]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h2 id="glossary-modal-title" className="text-base font-bold text-white font-mono">
                Glosario Científico & Marco Epistémico
              </h2>
              <p id="glossary-modal-subtitle" className="text-xs text-slate-400">
                PROMETHEUS IGNIS — Semillero de Astronomía del ITM (NASA Space Apps Medellín 2026)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar glosario"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="space-y-3">
            {TERMS.map((entry) => (
              <div
                key={entry.term}
                className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5"
              >
                <h3 className="font-mono font-bold text-amber-300 text-sm">{entry.term}</h3>
                <p className="text-slate-300 leading-relaxed text-[11px]">{entry.definition}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#091424] flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-mono">
            Fuentes: Giglio et al. (2016), Schroeder et al. (2014), NASA FIRMS, UNDRR Sendai
            Framework (2015).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-mono text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
