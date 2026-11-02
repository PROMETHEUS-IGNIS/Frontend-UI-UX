# MEMORY.md — PROMETHEUS IGNIS Frontend
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- Alineación docs ↔ interfaz completada (2026-11-01): `PROJECT_CONTEXT.md` y `ROADMAP.md`
  reescritos en torno a la UI congelada. Aún NO hay código en este repo (solo docs).
- Referencia de interfaz congelada: `../prometheus-ignis` (export de AI Studio, no modificable).
- Stack previsto del repo: React+TS+Vite+Tailwind+MapLibre+TanStack Query+Zustand+Vitest/ESLint.
## Decisiones (y por qué)
- UI congelada/innegociable: pantallas y textos de la plantilla son canónicos; solo la capa
  de servicios/adaptadores es ajustable.
- Eliminado por decisión del equipo: pestaña+modal «FastAPI Lab», capas de límites
  administrativos y modo «Demostración/Lab Real». Única fuente de datos: Backend-API vía
  `VITE_API_BASE_URL`; sin dataset sintético de producto (fixtures solo en tests).
- Fórmulas científicas oficiales v1.0 (PROJECT_CONTEXT §3): recurrencia 0–100 (días 50 pts,
  intensidad 30, FRP max 20; niveles ≤20/40/60/80), Matriz P=A×C (bandas ≤4/≤9/≤15),
  confianza armonizada (l→20, n→60, h→90; numérico <30/30–80/≥80), concordancia solo
  `single_sensor` hasta regla aprobada.
- Navegación: pestañas sin React Router en v1 (HashRouter = extensión futura opcional).
- Timeline FUNCIONAL (filtra puntos del mapa por `acq_date`), no decorativa.
- AI-Pipeline = repositorio separado; Laboratorio IA solo muestra artefactos publicados;
  sin artefactos → «En desarrollo»; nunca entrenar en navegador.
- Campos `satellite`, `daynight`, `brightness_k`, `department`, `municipality`: solicitados
  al backend; prohibido rellenarlos (la plantilla los inventaba).
## Aprendizajes y errores a evitar
- El cliente de la plantilla asumía `metadata`/`results`; el contrato real es
  `data`/`count`/`total_matching`/`data_provenance` → adaptador según OpenAPI vigente.
- La plantilla fabricaba datos (`frp_mw || 10.0`, `brightness_k || 320`, ids aleatorios,
  depto 'Antioquia'): correcciones de integridad obligadas al portar (PROJECT_CONTEXT §6).
- Frase clave a conservar: `frp_mw: null` → «No disponible», jamás 0.
## Próximos pasos
- Sincronizar `AGENTS.md` con las nuevas trampas de dominio (tarea aparte ya acordada).
- Ejecutar Fase 0 del roadmap (base React+Vite+Tailwind+Vitest) y luego Fase 1-2.
- Coordinar con Backend-API: campos FIRMS extendidos y forma de respuesta.
