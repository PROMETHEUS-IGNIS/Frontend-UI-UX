# MEMORY.md — PROMETHEUS IGNIS Frontend
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- Fase 0 COMPLETADA (2026-11-01): base React+TS+Vite funcional y verificada (lint,
  typecheck, 3 tests, build, dev server HTTP 200). Sin commit aún (espera autorización).
- Docs alineados a la interfaz congelada (`../prometheus-ignis`): PROJECT_CONTEXT,
  ROADMAP, AGENTS (commit `79a65ab`, rama `feature/steve`).
- Stack instalado: React 19.3, Vite 8.3, TS 6.0, Tailwind 4.3 (@tailwindcss/vite),
  MapLibre 6, ECharts 6, TanStack Query 5, Zustand 5, ESLint 10 flat, Vitest 5 + RTL.
- Shell de pestañas sin router funcionando: `src/App.tsx` + `src/stores/uiStore.ts`,
  placeholder "Módulo en desarrollo" en los 4 módulos.
## Decisiones (y por qué)
- UI congelada/innegociable: pantallas y textos de la plantilla son canónicos; solo la
  capa de servicios/adaptadores es ajustable. Fase 1 construye el Header de verdad.
- Eliminado por decisión del equipo: pestaña+modal «FastAPI Lab», capas de límites
  administrativos y modo «Demostración/Lab Real». Única fuente de datos: Backend-API vía
  `VITE_API_BASE_URL`, sin dataset sintético de producto (fixtures solo en tests).
- Fórmulas científicas oficiales v1.0 (PROJECT_CONTEXT §3): recurrencia 0–100
  (días 50 pts, intensidad 30, FRP 20; niveles ≤20/40/60/80), Matriz P=A×C
  (bandas ≤4/≤9/≤15), confianza armonizada (l→20, n→60, h→90; num <30 low, ≥80 high),
  concordancia solo `single_sensor` hasta regla aprobada.
- TS 6: `baseUrl` deprecado → en `tsconfig.app.json` usar `paths: {"@/*": ["./src/*"]}`.
- Alias de imports `@` → src, definido en tsconfig + vite.config.ts (única fuente de
  verdad de paths).
## Aprendizajes y errores a evitar
- Cliente de la plantilla asumía `metadata`/`results`; el contrato real es
  `data`/`count`/`total_matching`/`data_provenance` → adaptador según OpenAPI vigente.
- Plantilla fabricaba datos (`frp_mw || 10.0`, ids aleatorios, depto implícito):
  correcciones obligadas al portar (PROJECT_CONTEXT §6). `frp_mw: null` = «No disponible».
- Vitest con `globals: false`: RTL no auto-limpia → usar `cleanup()` y resetear el
  store de Zustand entre tests (`useUiStore.setState`).
- npm audit: 12 moderados dev-only via `minimatch <11.0.1` en ESLint (sin fix aún); no
  llegan al bundle.
## Próximos pasos
- Commit de Fase 0 cuando se autorice; luego Fase 1 (Header + identidad visual congelada
  + Glosario) según HU-01.x del ROADMAP.
- Coordinar con Backend-API: campos FIRMS extendidos y forma de respuesta.
