/**
 * Identificadores de módulos navegables de la interfaz congelada.
 * El orden define el orden visual de las pestañas (Header, Fase 1).
 */
export const APP_MODULES = [
  {
    id: 'explorer',
    label: 'Mapa Territorial',
    description:
      'Exploración geoespacial de observaciones MODIS y VIIRS con línea de tiempo.',
  },
  {
    id: 'analytics',
    label: 'Analítica & Tiempos',
    description:
      'Resumen descriptivo del conjunto consultado con definiciones oficiales v1.0.',
  },
  {
    id: 'comparison',
    label: 'Matriz 5×5',
    description: 'Gestión del riesgo territorial P = Amenaza × Consecuencia.',
  },
  {
    id: 'laboratory',
    label: 'Laboratorio IA',
    description: 'Fichas de los modelos publicados por el AI-Pipeline.',
  },
] as const;

export type AppModule = (typeof APP_MODULES)[number];

export type AppModuleId = AppModule['id'];
