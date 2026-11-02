# PROMETHEUS IGNIS — Frontend

Plataforma web de inteligencia territorial para explorar y analizar detecciones de focos de calor de los instrumentos **MODIS** y **VIIRS** con alcance **Antioquia → Colombia**. Proyecto del Semillero de Astronomía ITM para **NASA Space Apps Challenge 2026** (reto *Harmonization of MODIS and VIIRS Hot Spots*).

Documentación del proyecto:

- `AGENTS.md` — reglas de trabajo y trampas de dominio (leer antes de desarrollar).
- `PROJECT_CONTEXT.md` — producto, interfaz congelada y **fórmulas científicas oficiales v1.0**.
- `ROADMAP.md` — fases, historias de usuaria y criterios de aceptación.

## Requisitos

- Node.js ≥ 22 LTS (verificado con v24).
- npm (único gestor de paquetes; mantener `package-lock.json` versionado).

## Instalación y comandos

```bash
npm install          # instalar dependencias desde un clon limpio
npm run dev          # servidor de desarrollo (http://localhost:5173)
npm run build        # verificación de tipos + build de producción (dist/)
npm run lint         # ESLint (flat config)
npm run typecheck    # TypeScript strict (tsc -b con noEmit)
npm run test         # Vitest (run único)
npm run test:watch   # Vitest en modo observación
```

### Configuración de entorno

`VITE_API_BASE_URL` apunta al Backend-API (repositorio [`PROMETHEUS-IGNIS/Backend-API`](https://github.com/PROMETHEUS-IGNIS/Backend-API)):

```bash
cp .env.example .env
```

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Las variables `VITE_*` se incorporan al bundle público: nunca coloques secretos, tokens ni credenciales en ellas. Los endpoints vigentes del backend son `GET /api/v1/health` y `GET /api/v1/observations` (contrato real en su `docs/api-contracts.md` y OpenAPI).

## Decisión de base y alcance

- La interfaz está **congelada**: la fuente visual y textual aprobada es la exportación de la propuesta en `../prometheus-ignis` (directorio hermano de este repositorio). Las pantallas, leyendas y microcopy se reproducen tal cual; la capa de servicios/adaptadores es lo ajustable.
- App de **una sola página con navegación por pestañas** (sin React Router en v1); el estado de la pestaña activa vive en Zustand.
- **Única fuente de datos:** el Backend-API. Sin modo demostración ni dataset sintético de producto (fixtures solo en pruebas, etiquetadas).
- Reglas científicas núcleo: MODIS y VIIRS nunca se suman; `frp_mw: null` se muestra «No disponible»; confianza original `confidence_raw` intacta junto al nivel armonizado v1.0; coordenadas GeoJSON `[longitude, latitude]`; truncamiento explícito con `total_matching`.

## Estructura

```text
src/
├── app/                   # Configuración de aplicación y providers (queryClient)
├── assets/                # Recursos importados por componentes
├── components/
│   ├── common/            # Elementos genéricos reutilizables
│   ├── layout/            # Header, navegación y shell (Fase 1)
│   ├── maps/              # Elementos cartográficos reutilizables (Fase 3)
│   ├── charts/            # Wrappers y componentes de gráficas (Fase 4)
│   └── filters/           # Controles de filtrado reutilizables (Fase 3)
├── features/
│   ├── explorer/          # Mapa Territorial
│   ├── analytics/         # Analítica & Tiempos
│   ├── comparison/        # Matriz 5×5
│   └── laboratory/        # Laboratorio IA
├── hooks/                 # Hooks compartidos
├── services/
│   ├── api/               # Cliente HTTP y servicios por recurso (único lugar de red)
│   └── adapters/          # Adaptación API -> modelos de presentación
├── stores/                # Estado global de interfaz (Zustand)
├── test/                  # Configuración de pruebas (jest-dom)
├── types/
│   ├── api/               # Tipos que reflejan el contrato HTTP real
│   └── domain/            # Modelos internos de la interfaz
└── utils/                 # Funciones puras y utilidades
```

## Estado remoto vs estado de interfaz

- **Servidor:** TanStack Query (`src/app/queryClient.ts`, un solo pool por sesión). Componentes de presentación nunca llaman HTTP directo.
- **Interfaz global:** Zustand (`src/stores/uiStore.ts`); no duplica estado remoto.

## Stack

React 19 · TypeScript (strict) · Vite 8 · Tailwind CSS 4 (`@tailwindcss/vite`) · MapLibre GL JS · Apache ECharts · TanStack Query 5 · Zustand 5 · ESLint (flat config) · Vitest + Testing Library.

## Notas conocidas

- Las dependencias de desarrollo del linter arrastran `minimatch <11.0.1` (GHSA-g3hv-75wg-m249, 12 avisos moderados, sin fix disponible aún); son solo-dev y no se incluyen en el bundle de producción.
- Calidad requerida para dar una tarea por terminada: ver «Definition of Done» en `ROADMAP.md` §7.
