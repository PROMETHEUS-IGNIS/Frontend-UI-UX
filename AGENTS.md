# AGENTS.md — PROMETHEUS IGNIS Frontend

PROMETHEUS IGNIS es una plataforma web de inteligencia territorial para explorar y analizar detecciones de focos de calor de MODIS y VIIRS. El frontend permite visualizar observaciones, comparar instrumentos y presentar resultados científicos consumiendo la API independiente del proyecto.

## Stack y estructura

### Tecnologías y versiones clave

- Node.js: usar una versión LTS compatible con la versión de Vite instalada; preferir Node.js 22 LTS o superior si las dependencias del proyecto lo permiten.
- Gestor de paquetes: npm. Mantener `package-lock.json` versionado; no mezclar npm, pnpm, yarn o Bun.
- React + TypeScript: interfaz y tipado estático.
- Vite: servidor de desarrollo y build.
- React Router: navegación entre módulos.
- Tailwind CSS: estilos, responsive design y tokens visuales.
- MapLibre GL JS: mapa y renderizado geoespacial WebGL.
- Apache ECharts: gráficas y analítica.
- TanStack Query: estado de servidor, caché y sincronización de consultas.
- Zustand: estado global de interfaz compartido.
- Vitest + React Testing Library: pruebas unitarias y de componentes.
- ESLint: análisis estático. Añadir Prettier solo si el repositorio lo adopta explícitamente.

Las versiones exactas deben gestionarse en `package.json` y `package-lock.json`. No inventes versiones ni actualices dependencias mayores sin autorización. Antes de añadir una biblioteca, comprueba si ya existe una solución instalada que cubra la necesidad.

### Estructura objetivo

La estructura siguiente es una guía de organización. Inspecciona el repositorio antes de crear carpetas y conserva las decisiones ya implementadas.

```text
frontend/
├── public/                    # Recursos estáticos públicos
├── src/
│   ├── app/                   # Configuración de aplicación, providers y router
│   ├── assets/                # Recursos importados por componentes
│   ├── components/
│   │   ├── common/            # Componentes genéricos reutilizables
│   │   ├── layout/            # Header, navegación, sidebar y shell
│   │   ├── maps/              # Elementos cartográficos reutilizables
│   │   ├── charts/            # Wrappers y componentes de gráficas
│   │   └── filters/           # Controles de filtrado reutilizables
│   ├── features/
│   │   ├── explorer/          # Mapa Territorial
│   │   ├── analytics/         # Analítica y tiempos
│   │   ├── comparison/        # Matriz y comparación
│   │   └── laboratory/        # Laboratorio de armonización
│   ├── hooks/                 # Hooks compartidos
│   ├── services/
│   │   ├── api/               # Cliente HTTP y servicios por recurso
│   │   └── adapters/          # Adaptación API -> modelos de presentación/dominio
│   ├── stores/                # Estado global Zustand
│   ├── types/
│   │   ├── api/               # Tipos que reflejan contratos HTTP
│   │   └── domain/            # Modelos internos de la aplicación
│   ├── utils/                 # Funciones puras y utilidades
│   ├── styles/                # Estilos globales y tokens si aplica
│   ├── App.tsx
│   └── main.tsx
├── .env.example               # Variables públicas de configuración (sin secretos)
├── index.html
├── package.json
├── package-lock.json
├── tsconfig*.json
├── vite.config.ts
└── README.md
```

Responsabilidades importantes:

- `features/`: agrupa por funcionalidad de producto; cada módulo mantiene sus componentes, hooks y lógica específica cuando crezca.
- `services/api/`: único lugar para comunicación HTTP y definición de endpoints.
- `services/adapters/`: transforma respuestas API a modelos de UI sin alterar su semántica científica.
- `types/api/`: refleja los contratos reales del backend; no debe contener campos inventados.
- `types/domain/`: tipos internos solo cuando aporten una distinción útil frente al contrato API.
- `stores/`: estado global de interfaz (por ejemplo, filtros compartidos); no dupliques aquí el estado remoto que administra TanStack Query.
- `components/`: solo componentes realmente compartidos; evita convertir cada elemento de una pantalla en un componente global.

El backend oficial es `https://github.com/PROMETHEUS-IGNIS/Backend-API`. Su contrato compartido se encuentra en `docs/api-contracts.md` y su OpenAPI local en `http://127.0.0.1:8000/openapi.json`. El contrato/OpenAPI vigente prevalece sobre ejemplos antiguos de este documento.

## Comandos

Ejecutar desde la raíz del repositorio frontend.

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

### Verificaciones

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Los scripts anteriores deben estar definidos en `package.json`. Si alguno todavía no existe, no declares que se ejecutó correctamente: informa que falta configurarlo y solicita autorización antes de añadir herramientas o cambiar scripts fuera de la tarea aprobada.

Para ejecutar pruebas en modo observación, si el script está configurado:

```bash
npm run test -- --watch
```

Para inspeccionar las dependencias instaladas:

```bash
npm ls --depth=0
```

Para levantar el backend durante la integración local, sigue las instrucciones de su README. En el repositorio backend, desde su raíz y con el entorno virtual activado:

```bash
python -m uvicorn app.main:app --reload
```

URLs locales documentadas:

- Backend: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- OpenAPI: `http://127.0.0.1:8000/openapi.json`

No asumas que el backend está levantado ni que los endpoints futuros están implementados. Comprueba su disponibilidad antes de realizar pruebas de integración.

## Convenciones

- Código, nombres de archivos, variables, funciones, componentes, tipos, props y comentarios técnicos: inglés.
- Documentación del equipo, mensajes de explicación y textos de interfaz: español, salvo nombres propios, terminología técnica o una decisión de producto diferente.
- Componentes React y tipos/clases: `PascalCase`.
- Hooks: prefijo `use` y `camelCase`.
- Funciones, variables y propiedades: `camelCase`.
- Constantes globales: `UPPER_SNAKE_CASE` cuando corresponda.
- Archivos de componentes: `PascalCase.tsx` o el patrón ya establecido por el repositorio. Archivos de hooks/servicios/utilidades: `camelCase.ts`.
- Preferir componentes funcionales, hooks y composición.
- Usa TypeScript estricto. Evita `any`; cuando la forma sea desconocida, usa `unknown` y valida.
- Mantén componentes pequeños, con responsabilidades claras. Extrae lógica reutilizable a hooks o servicios cuando tenga sentido.
- No realices llamadas HTTP directamente dentro de componentes de presentación.
- Usa TanStack Query para estado remoto; Zustand para estado global de interfaz. Evita duplicar el mismo estado en ambos.
- Mantén los tipos API separados de los modelos de dominio/UI.
- Centraliza el cliente HTTP, la URL base, la serialización de parámetros y el manejo de errores.
- Usa `import.meta.env` para configuración Vite y declara las variables en `vite-env.d.ts` si corresponde.
- Prefiere accesibilidad semántica: etiquetas, botones reales, foco visible, navegación por teclado, textos alternativos y contraste suficiente.
- Evita estilos inline salvo para valores dinámicos que no puedan expresarse razonablemente con clases o tokens.
- Mantén la identidad visual PROMETHEUS IGNIS: tema oscuro, base azul-negra, acentos naranja/ámbar y cian; evita saturar todos los elementos con color.
- Los textos visibles deben ser concisos y consistentes. Fechas, unidades y etiquetas deben ser comprensibles para el usuario.
- No añadas comentarios que repitan el código. Explica decisiones no obvias y limitaciones de dominio.
- Referencias principales: `PROJECT_CONTEXT.md` para producto y dominio; `docs/api-contracts.md` del backend para contratos; componentes existentes para patrones visuales.

## Reglas de dominio / trampas conocidas

- MODIS y VIIRS son instrumentos/productos diferentes. No son intercambiables y sus resoluciones, horarios de observación, campos y niveles de confianza pueden diferir.
- No sumes conteos de ambos sensores para afirmar un número de incendios ni interpretes mayor cantidad de detecciones como mayor cantidad de incendios reales.
- Una observación no equivale necesariamente a un incendio/evento independiente. No agrupes detecciones en eventos sin una regla aprobada.
- Conserva `confidence_raw` exactamente como llega del backend. No conviertas categorías VIIRS (`l`, `n`, `h`) y valores numéricos MODIS a una escala común sin método científico aprobado.
- No inventes ni calcules `confidence_score`.
- `frp_mw` puede ser `null`; representa el valor como no disponible, no como cero.
- Conserva unidades y procedencia. FRP se expresa en MW cuando el contrato así lo indique.
- `acquired_at` es fecha/hora de adquisición en UTC según el contrato actual. Formatea para lectura local si se requiere, pero conserva el instante y evita mezclar UTC con hora local en filtros.
- Coordenadas API: `latitude` y `longitude` en grados decimales. GeoJSON requiere el orden `[longitude, latitude]`, no `[latitude, longitude]`.
- Valida rangos geográficos: latitud [-90, 90], longitud [-180, 180].
- Distingue respuesta vacía (`200` con `data: []`) de error, falta de cobertura o backend indisponible.
- La colección actual documentada incluye `data`, `count`, `total_matching` y `data_provenance`. `total_matching` puede ser mayor que `count` porque `limit` trunca resultados; la API v0.1.0 no implementa paginación.
- El backend documenta actualmente `GET /api/v1/health` y `GET /api/v1/observations`, con `sensor` opcional (`MODIS` o `VIIRS`) y `limit` entre 1 y 1000. Verifica el OpenAPI actual antes de depender de filtros adicionales.
- Los datos actuales del backend están identificados como `synthetic_demo` y no son observaciones reales de NASA. La UI debe mostrar claramente el modo demostrativo cuando la procedencia lo indique.
- No asumas que filtros por fechas, bounding box, calendario, analítica, armonización o exportación ya existen en backend.
- No muestres indicadores de recurrencia, coincidencia, precisión, calidad o armonización sin fórmula, unidad, población y definición aprobadas.
- La resolución nominal aproximada de los productos de focos de calor no debe presentarse como tamaño exacto de cada incendio ni como garantía de precisión posicional.
- No renderices miles de marcadores DOM/React individuales. Usa capas MapLibre/WebGL; evalúa clustering, agregación, filtros en servidor y carga por región/ventana.
- No descargues ni mantengas todos los datos históricos en memoria del navegador. Respeta límites y comunica el truncamiento.
- Las variables `VITE_*` se incorporan al bundle público. Nunca almacenes secretos, tokens privados ni credenciales en ellas.
- El backend es un repositorio separado. No modifiques sus archivos desde este repositorio ni cambies sus contratos unilateralmente.

## Forma de trabajar

1. Lee `PROJECT_CONTEXT.md`, este archivo y el código relacionado antes de actuar.
2. Inspecciona `package.json`, lockfile, scripts, estructura y estado de Git. No presupongas que la estructura objetivo ya existe.
3. Para cambios locales y de bajo riesgo, implementa directamente cuando los criterios estén claros.
4. Antes de cambios de arquitectura, navegación, dependencias, configuración global, contratos API o varios módulos, presenta un plan breve y espera aprobación.
5. Divide el trabajo en cambios pequeños, coherentes y revisables. No mezcles refactorizaciones ajenas a la solicitud.
6. No implementes pantallas completas con datos ficticios presentados como reales. Si se necesitan fixtures, guárdalos en una ubicación de pruebas/desarrollo y etiquétalos.
7. No crees endpoints ni campos API imaginarios para desbloquear una pantalla.
8. Añade o modifica pruebas para cada comportamiento nuevo o corregido.
9. Ejecuta lint, typecheck, pruebas y build pertinentes. Si no puedes ejecutarlos, dilo explícitamente.
10. Revisa `git diff` para detectar cambios accidentales, secretos, archivos generados y modificaciones no relacionadas.
11. Actualiza documentación si cambian comandos, configuración, navegación, contratos o decisiones relevantes.
12. Al terminar, explica resumen, archivos modificados, decisiones, verificaciones ejecutadas y pendientes/riesgos.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Límites

### ✅ Siempre

- Respetar `PROJECT_CONTEXT.md`, este archivo y los contratos vigentes del backend.
- Mantener TypeScript estricto y componentes accesibles.
- Separar presentación, estado remoto, estado de interfaz y comunicación API.
- Mostrar estados de carga, error, vacío y datos sintéticos cuando aplique.
- Conservar procedencia, unidades, valores originales y semántica de los datos.
- Usar `longitude, latitude` al construir coordenadas GeoJSON.
- Probar los cambios y reportar resultados reales.
- Mantener la interfaz consistente con la identidad visual de PROMETHEUS IGNIS.
- Consultar OpenAPI/contrato antes de implementar una integración nueva.
- Mantener secretos fuera del repositorio.
- Actualizar `MEMORY.md` al terminar cada tarea. 

### ⚠️ Pregunta antes

- Añadir, quitar o actualizar dependencias.
- Cambiar el gestor de paquetes o reemplazar el lockfile.
- Cambiar versiones mayores de React, Vite, TypeScript, MapLibre u otras dependencias principales.
- Crear archivos de configuración global, pipelines CI/CD, Docker, mecanismos de despliegue o infraestructura.
- Crear una nueva estructura de carpetas sustancial o reorganizar ampliamente el repositorio.
- Cambiar rutas de navegación o eliminar módulos visibles.
- Cambiar el formato, nombres, tipos o semántica de datos recibidos del backend.
- Añadir endpoints, parámetros, filtros o capacidades que no existan en el contrato.
- Definir métricas, equivalencias de confianza, reglas de agrupación de incendios o algoritmos científicos.
- Incorporar servicios de mapas, geocodificación, analítica o terceros que requieran cuentas, claves o condiciones de uso.
- Eliminar archivos, realizar cambios destructivos o sobrescribir trabajo de otros agentes.

Cuando una decisión requiera aprobación, explica necesidad, alternativas e impacto antes de modificar.

### 🚫 Nunca

- Presentar datos sintéticos como observaciones reales de NASA.
- Inventar resultados, métricas científicas, detecciones o validaciones.
- Alterar valores originales de confianza o unidades para hacerlos comparables sin método aprobado.
- Tratar una detección como un incendio independiente sin regla validada.
- Cambiar contratos del backend silenciosamente o simular que endpoints pendientes existen.
- Introducir secretos, tokens o credenciales en el código o bundle frontend.
- Desactivar TypeScript, lint o pruebas para ocultar errores.
- Eliminar o relajar pruebas para hacer pasar una compilación.
- Afirmar que un comando pasó si no se ejecutó.
- Hacer commits, pushes, releases o despliegues sin solicitud explícita.
- Ejecutar comandos destructivos o descartar cambios de otros colaboradores sin autorización.

## Verificación

Antes de declarar terminada una tarea:

1. Comprueba que el cambio cumple los criterios de aceptación y no altera funcionalidades no relacionadas.
2. Ejecuta los comandos disponibles en `package.json`:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

3. Si un script no existe, indícalo. No inventes un resultado ni modifiques la configuración fuera del alcance aprobado.
4. Para cambios de componentes, verifica estados normal, carga, error, vacío y responsive cuando correspondan.
5. Para cambios de mapa, verifica:
   - Orden GeoJSON `[longitude, latitude]`.
   - Rangos de coordenadas.
   - Diferenciación de MODIS y VIIRS.
   - Selección y detalle de observaciones.
   - Rendimiento con el volumen de datos disponible.
   - Leyenda y accesibilidad de los controles.
6. Para cambios de integración, verifica:
   - URL base configurada por entorno.
   - Respuesta de `/api/v1/health`.
   - Estructura real de `/api/v1/observations`.
   - Filtro `sensor` y límite `limit` según OpenAPI vigente.
   - Manejo de `200` vacío, `422`, errores de red y `data_provenance`.
   - CORS si el navegador bloquea la solicitud.
7. No declares que la integración funciona si solo se probó con mocks. Distingue pruebas unitarias, pruebas con backend real y validación científica.
8. Revisa `git diff` y confirma que no se incluyeron secretos, archivos temporales o cambios ajenos.
9. En el informe final, enumera los comandos ejecutados y su resultado exacto; identifica lo que no se pudo comprobar.
