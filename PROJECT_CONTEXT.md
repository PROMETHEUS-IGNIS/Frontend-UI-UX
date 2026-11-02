# PROJECT_CONTEXT.md — PROMETHEUS IGNIS Frontend

## Rol

Actúas como agente de ingeniería frontend dentro del proyecto **PROMETHEUS IGNIS**, desarrollado por el Semillero de Astronomía para NASA Space Apps Challenge 2026, en respuesta al reto *Harmonization of MODIS and VIIRS Hot Spots*.

Tu responsabilidad es implementar, probar y documentar la interfaz web aprobada del proyecto. Trabaja como un ingeniero frontend senior: prioriza la exactitud en la representación científica, la accesibilidad, la mantenibilidad, el rendimiento geoespacial y la integración mediante contratos explícitos.

No eres responsable de inventar ni modificar métodos científicos de armonización. Las definiciones científicas oficiales del producto están fijadas en este documento (sección «Definiciones científicas oficiales v1.0»); cualquier cambio a ellas requiere una decisión documentada del equipo.

## Fuente de interfaz aprobada (congelada)

La interfaz de referencia aprobada es la propuesta exportada de Google AI Studio, ubicada en el directorio relativo **`../prometheus-ignis`** (un nivel por encima de este repositorio). Su dirección visual es una plataforma científica de tema oscuro (base azul-negra `#060b13`, paneles `#070e1a`/`#08111e`), acentos ámbar/naranja para datos y cian para estados informativos, navegación por pestañas y un explorador geoespacial como pantalla principal.

Reglas de la fuente congelada:

1. **La UI es innegociable.** Las pantallas, componentes, jerarquías, leyendas, microcopy y estructura de los 4 módulos se reproduce fielmente. Los textos de la plantilla (banners científicos, glosario, advertencias, guía rápida) son contenido canónico; solo admiten ajustes mínimos de redacción sin alterar su sentido.
2. **Quedan excluidos del alcance**, por decisión del equipo:
   - La pestaña y el modal **FastAPI Lab** (el backend se consume exclusivamente mediante `VITE_API_BASE_URL`; los errores de conexión se muestran como estados en línea, sin panel de configuración de URL).
   - Las capas de **límites administrativos** (`ANTIOQUIA_SUBREGIONS_GEOJSON` / `COLOMBIA_BOUNDARIES_GEOJSON` y sus checks en el panel Capas). Quedan como extensión futura con geometrías oficiales (IGAC/DANE) y procedencia citada, si el equipo las aprueba.
   - El interruptor **Demostración / Lab Real** y todo dataset sintético de producto. La única fuente de datos es el Backend-API (sección «Modelo de datos»).
3. **Lo que sí es ajustable:** la capa de servicios y adaptadores (parsing según el OpenAPI vigente, manejo de errores, derivación de campos compatibles) siempre que la UI resultante sea idéntica. Ver «Correcciones de integridad obligadas al portar».
4. Cambios de navegación, nuevos módulos o cambios visuales requieren decisión explícita del equipo antes de implementarse.

## Contexto

### 1. Propósito del producto

PROMETHEUS IGNIS es una plataforma de inteligencia territorial para explorar, analizar y comunicar detecciones de focos de calor obtenidas por los instrumentos MODIS y VIIRS, con alcance territorial **Antioquia → Colombia**.

Es una aplicación de **una sola página con navegación por pestañas** (sin React Router en v1). Los cuatro módulos comparten la misma sesión: el mismo estado de filtros, la misma conexión y el mismo conjunto de observaciones descargadas del backend.

El producto entregado en esta versión:

- Explora geográficamente las observaciones del backend (Mapa Territorial) con filtros por departamento/municipio, período, sensor, plataforma, confianza, día/noche, FRP mínimo y búsqueda.
- Registra la evolución temporal de las observaciones con una línea de tiempo funcional (reproducción, scrubber e histograma diario) que filtra los puntos del mapa.
- Presenta analítica histórica descriptiva: conteos por sensor (nunca sumados), índice de recurrencia oficial v1.0, FRP promedio/máxima, evolución mensual, distribución día/noche y ficha técnica comparativa de sensores.
- Sitúa la gestión del riesgo territorial con la Matriz 5×5 oficial (P = Amenaza × Consecuencia) sobre zonas documentadas.
- Expone las fichas de los modelos entrenados por el AI-Pipeline del proyecto (Laboratorio IA), sin ejecutar nada en el navegador.
- Permite exportar a CSV los registros descargados y filtrados, y explica la procedencia del conjunto consultado.
- Incluye glosario científico y guía de uso.

### 2. Módulos de la interfaz (fuente congelada)

#### 2.1 Módulos navegables (pestañas)

1. **Mapa Territorial** (`TerritorialMap.tsx`)
   - Mapa MapLibre GL centrado en Antioquia `[longitude, latitude] = [-75.6, 6.4]`, zoom 7.
   - 4 basemaps intercambiables: OpenFreeMap Liberty, Satélite (Esri World Imagery + etiquetas), Topográfico (Esri World Topo) y Oscuro (Carto dark). Se conservan las atribuciones de cada proveedor y las capas de datos se re-agregan tras el cambio de estilo.
   - Vistas rápidas de cámara (`flyTo`): Antioquia (z 7.2), Colombia [-73.5, 4.5] (z 5.2), Valle de Aburrá [-75.58, 6.25] (z 11.0), Bajo Cauca [-75.1, 7.75] (z 8.6) y Urabá [-76.7, 8.1] (z 8.8). Son presets de cámara, no capas de límites.
   - Capas de focos sobre una única source GeoJSON (render WebGL, nunca un marcador DOM por punto): puntos por sensor (VIIRS naranja `#ea580c`, MODIS ámbar `#fbbf24`), halo según sensor y capa de densidad térmica (heatmap FRP) activable.
   - Colores de datos: halo MODIS `#f59e0b`, halo VIIRS `#ff5722`; bordes de punto blancos, en cian `#38bdf8` cuando la concordancia sea `coincident_high` (ver definiciones).
   - Panel de capas con interruptores: Puntos Satelitales, Densidad Térmica (FRP).
   - Leyenda persistente (VIIRS ~375 m naranja / MODIS ~1000 m ámbar) y atribución compacta.
   - Selección de observación → panel de inspección con FRP (MW, o «No disponible»), confianza (nivel armonizado + `confidence_raw` original), temperatura de brillo (si existe), hora de adquisición UTC, coordenadas, municipio/departamento (si existen) y descripción instrumental del sensor.
   - **Línea de tiempo funcional**: prev/pausa/play/next, velocidad 1×/2×/5×, scrubber e histograma diario; el paso temporal activo **filtra los puntos visibles en el mapa** por `acq_date`; badge científico permanente: «La ausencia de datos en un paso orbital no equivale a ausencia de incendios».
   - Modal de ayuda «¿Cómo usar PROMETHEUS IGNIS en 3 pasos?» (texto canónico de la plantilla).
   - Sin capas de límites administrativos (excluidas por decisión del equipo).

2. **Analítica & Tiempos** (`AnalyticsPanel.tsx`)
   - Título con la zona evaluada (municipio → departamento → conjunto nacional).
   - Banner metodológico canónico: resoluciones y horarios de MODIS/VIIRS difieren; contar detecciones de ambos sensores junto sin armonización sesga el análisis; una mayor cantidad de detecciones no implica más incendios.
   - 4 tarjetas KPI: detecciones VIIRS, detecciones MODIS (siempre separadas), Índice de Recurrencia (score 0–100 + nivel oficial v1.0) y FRP promedio/máxima.
   - Histograma mensual con barras agrupadas VIIRS/MODIS, tooltip por mes (conteo y FRP promedio) y leyenda.
   - Distribución por horario orbital (pases diurnos/nocturnos), condicionada a la disponibilidad del campo `daynight` (ver modelo de datos).
   - Ficha técnica comparativa de sensores (plataformas, resoluciones, implicación territorial) con referencias Giglio et al. (2016) y Schroeder et al. (2014).
   - Exportación CSV del conjunto filtrado.

3. **Matriz 5×5** (`RiskMatrix5x5.tsx`)
   - Matriz de gestión del riesgo territorial 5×5: eje vertical Consecuencia (C), eje horizontal Amenaza (A), producto `P = A × C` (1–25) mostrado por celda.
   - Interactiva: clic en celda y sliders para fijar A y C manualmente; selector de zonas documentadas.
   - Perfil de zona: justificación de la amenaza, justificación de la consecuencia, elementos expuestos (población, infraestructura crítica, áreas protegidas, accesibilidad) y recomendaciones preventivas de planificación.
   - Advertencia metodológica canónica: el producto ordinal es un esquema ilustrativo de priorización; no estima riesgo probabilístico futuro; la distinción se comunica con texto y nivel ordinal, nunca solo con color.
   - Pie: orientaciones de planificación; no son instrucciones operativas para emergencias.

4. **Laboratorio IA** (`AILaboratory.tsx`)
   - Muestra las fichas documentadas de los modelos publicados por el **AI-Pipeline** (ver «Arquitectura del sistema»): objetivo (`targetName`), versión, algoritmo, muestras, dataset, métrica base, CV F1 / CV accuracy / recall de la clase minoritaria, importancia de variables por permutación con descripción, variables excluidas por regla anti-fuga, matriz de confusión y nota de cautela científica.
   - Auditoría de ingesta (registros limpios/descartados por producto y año).
   - Control de reentrenamiento **bloqueado**: los modelos nunca se entrenan ni ejecutan en el navegador.
   - Sin datos de ejemplo que parezcan resultados: si el equipo del pipeline aún no publica artefactos, el módulo muestra su estado «En desarrollo» sin inventar métricas.

#### 2.2 Componentes compartidos

- **Header** (`Header.tsx`): logo con núcleo de fuego y punto cian (armonización MODIS+VIIRS), título con degradado ámbar, badge cian «MODIS · VIIRS», subtítulo institucional; navegación por pestañas (barra horizontal en escritorio, barra compacta en móvil); **indicador pasivo de conexión con el backend** (sin configuración de URL); botón de glosario; botón de exportación CSV con contador de registros visibles. Sin conmutador de modo demostración.
- **Modal Glosario** (`GlossaryModal.tsx`): 7 términos canónicos (foco de calor, MODIS vs VIIRS, FRP, confianza FIRMS, recurrencia histórica, marco UNDRR, matriz 5×5) con fuentes.
- **Estados de UI** en toda la aplicación: carga, error de conexión, vacío, truncamiento y procedencia, siempre distinguibles entre sí.

### 3. Definiciones científicas oficiales v1.0

Estas definiciones quedan aprobadas por el equipo en esta versión. El frontend las aplica de forma exclusiva y trazable; modificar una fórmula requiere decisión documentada del equipo.

#### 3.1 Índice de Recurrencia Histórica (0–100)

Sobre el conjunto de observaciones descargadas y filtradas por la zona evaluada:

- Entradas: `n` = número de detecciones del conjunto; `distinctDays` = días distintos con detección (`acq_date`); `maxFrp` = FRP máxima observada en el conjunto (solo registros con FRP disponible).
- Cálculo:
  - `daysFactor = min(50, (distinctDays / 40) × 50)` — hasta 50 puntos con ≥ 40 días activos.
  - `intensityFactor = min(30, (n / 100) × 30)` — hasta 30 puntos.
  - `frpFactor = min(20, (maxFrp / 80) × 20)` — hasta 20 puntos.
  - `score = round(daysFactor + intensityFactor + frpFactor)`, acotado a [0, 100].
- Niveles ordinales oficiales: `≤ 20 «Muy baja»`, `≤ 40 «Baja»`, `≤ 60 «Moderada»`, `≤ 80 «Alta»`, resto `«Muy alta»`.
- Complementos documentados: FRP promedio (solo registros con FRP disponible), mes pico (mes con más detecciones del conjunto), conteo separado MODIS/VIIRS, ratio de persistencia temporal `min(1, distinctDays / 365)` (la plantilla fija el periodo de referencia a 365 días en v1.0).
- Advertencias obligatorias en pantalla: mide el registro acumulado del territorio, **no** es probabilidad de incendio futuro; el universo es el conjunto descargado (puede estar truncado por `limit`); las zonas se analizan con conteos separados por sensor.

#### 3.2 Matriz de Gestión del Riesgo 5×5

- Marco UNDRR (Sendai 2015): Amenaza = actividad histórica observada; Exposición = elementos humanos y naturales presentes; Vulnerabilidad = susceptibilidad ante el daño.
- Ejes: `A = Amenaza (1–5)` y `C = Consecuencia: exposición y vulnerabilidad (1–5)`; producto `P = A × C` (1–25). Valores de entrada se acotan a [1, 5].
- Bandas de priorización por producto (comunicadas con texto y nivel, nunca solo por color): `P ≤ 4` muy bajo, `P ≤ 9` bajo, `P ≤ 15` moderado, `P > 15` muy alto.
- Zonas documentadas de v1.0: «Valle X» (ejemplo conceptual del Capítulo 20), Bajo Cauca (Caucasia–Tarazá–El Bagre), Urabá Norte (Turbo–Necoclí) y Valle de Aburrá, cada una con justificaciones de amenaza/consecuencia, elementos expuestos y recomendaciones.
- El producto ordinal no estima riesgo probabilístico futuro ni demuestra equivalencia cuantitativa entre niveles; las recomendaciones son de planificación preventiva, no de respuesta a emergencias.

#### 3.3 Confianza armonizada (`confidence_level`, `confidence_score`)

Armonización oficial v1.0 a partir de `confidence_raw` (que **se conserva siempre sin alterar** y se muestra junto al nivel):

- Si `confidence_raw` es texto: `h`/`high` → nivel «high», score 90; `l`/`low` → nivel «low», score 20; cualquier otra categoría (incluida `n`/`nominal`) → nivel «nominal», score 60.
- Si `confidence_raw` es numérico: `score = valor original`; `score < 30` → «low»; `score ≥ 80` → «high»; en otro caso «nominal».
- Convención de presentación: siempre nivel armonizado + valor original (ej. `HIGH (h)`, `NOMINAL (42)`).

Toda conversión de confianza fuera de estas reglas está prohibida. El desafío científico completo (fuga, validación, calibración) pertenece al AI-Pipeline; el frontend no define escalas propias.

#### 3.4 Concordancia inter-sensor (`concordance`)

- Categorías oficiales: `single_sensor`, `coincident_moderate`, `coincident_high`.
- Semántica visual congelada: borde de punto en cian `#38bdf8` cuando la categoría sea `coincident_high`.
- **v1.0 con datos reales:** mientras la regla de coincidencia espaciotemporal entre observaciones MODIS y VIIRS no esté aprobada y documentada, toda observación se clasifica `single_sensor`. Está prohibido simular coincidencias. La activación de las coincidencias queda como extensión dependiente de una regla científica aprobada.

#### 3.5 Glosario científico

Los 7 términos y sus definiciones del `GlossaryModal` de la plantilla son contenido oficial del producto (foco de calor ≈ anomalía térmica, no incendio único; resoluciones ~1 km vs ~375 m; FRP en MW; confianza FIRMS por sensor; recurrencia histórica como registro acumulado; marco UNDRR Amenaza/Exposición/Vulnerabilidad; matriz 5×5 ordinal no probabilística), con las fuentes citadas: Giglio et al. (2016), Schroeder et al. (2014), NASA FIRMS, UNDRR Sendai Framework (2015).

#### 3.6 Reglas epistémicas heredadas de la plantilla

- No se predice la ocurrencia futura de incendios ni se determina causa antrópica/natural sin evidencia de terreno.
- La ausencia de detecciones en un paso temporal no equivale a ausencia de incendios (pasos orbitales con cobertura limitada).
- Regla anti-fuga del pipeline: las variables que definen la etiqueta (`frp`, `brightness_k`, `bright_ti4`, `bright_ti5`, y `confidence_*` en el clasificador de confianza) se excluyen de las features de entrada.
- Las variables día/hora de adquisición (`acq_hour`, `is_noche`) y las conclusiones de importancia por permutación se atribuyen siempre al AI-Pipeline, nunca a la interfaz.

### 4. Arquitectura del sistema

| Componente | Responsabilidad | Repositorio |
|---|---|---|
| Frontend Web | Esta aplicación: exploración, analítica, matriz, laboratorio, export | `Frontend-UI-UX` (este repositorio) |
| Backend-API | Servicio REST en Python/FastAPI: `/api/v1/health`, `/api/v1/observations`; conecta los artefactos de datos | https://github.com/PROMETHEUS-IGNIS/Backend-API |
| AI-Pipeline | Descarga y validación de datos NASA FIRMS (MODIS SP y VIIRS SP), validación geográfica para Colombia, exclusiones anti-fuga y entrenamiento de modelos Random Forest (intensidad térmica y fiabilidad). Se ejecuta localmente con `python -m src.main` | https://github.com/PROMETHEUS-IGNIS/AI-Pipeline |

El Laboratorio IA consume **fichas publicadas** por el AI-Pipeline (contenido estático versionado con procedencia del pipeline: versión, fecha/commit, dataset). El mecanismo de publicación (archivo versionado del pipeline o endpoint dedicado del backend) debe acordarse con el equipo del pipeline antes de conectar datos; hasta entonces el módulo permanece «En desarrollo». El navegador **nunca** ejecuta inferencia ni entrenamiento.

### 5. Modelo de datos de la interfaz

El modelo interno de observación (`FireObservation`) se compone así, clasificado por origen:

| Campo | Origen | Regla |
|---|---|---|
| `observation_id`, `sensor`, `latitude`, `longitude`, `acquired_at`, `frp_mw`, `confidence_raw`, `source` | **Contrato Backend-API** | Sin transformación de significado; `frp_mw` puede ser `null` |
| `acq_date`, `acq_time` | **Derivable en cliente** | Extraídos de `acquired_at` (ISO 8601 UTC); si la cadena no es parseable quedan nulos y se muestran «No disponible» |
| `confidence_level`, `confidence_score` | **Armonización v1.0 (cliente)** | Solo con las reglas de la sección 3.3; jamás se inventa un score |
| `satellite`, `daynight`, `brightness_k`, `department`, `municipality` | **Solicitado a Backend-API** (nativos de FIRMS) | Mientras el backend no exponga el campo, se presenta «No disponible» / «Pendiente de datos del backend». Está prohibido rellenarlo con valores por defecto |
| `concordance` | **Regla científica aprobada** | En v1.0 solo `single_sensor` (sección 3.4) |

Reglas transversales del modelo:

- `frp_mw: null` se muestra «No disponible». Nunca se sustituye por 0 ni por un valor por defecto (la plantilla hacía `Number(raw.frp_mw) || 10.0`; esa práctica queda prohibida al portar el adaptador).
- No existen `frp_mw || 10.0`, `brightness_k || 320.0`, departamentos implícitos («Antioquia»), satélites implícitos («Terra»/«Suomi-NPP») ni identificadores generados al azar cuando el backend no entrega el campo: eso son datos fabricados.
- Coordenadas en grados decimales; validación latitud [-90, 90], longitud [-180, 180]; GeoJSON siempre `[longitude, latitude]`.
- `acquired_at` es el instante de adquisición en UTC; la presentación local no destruye la referencia UTC.
- Los filtros avanzados (sensor, plataforma, confianza, día/noche, FRP, fechas, geografía, búsqueda) operan **en cliente** sobre el conjunto descargado en v1.0. Pasarlos a servidor solo cuando exista contrato.
- El filtro geográfico y el de día/noche dependen de campos solicitados al backend; si el conjunto no incluye el campo, el control se informa como «No disponible en este conjunto» y no altera los resultados sin decírselo al usuario.

### 6. Backend oficial

- Repositorio: https://github.com/PROMETHEUS-IGNIS/Backend-API
- Tecnología: Python + FastAPI + Pydantic.
- Base URL local documentada: `http://127.0.0.1:8000`; prefijo de API `/api/v1`.
- Swagger: `http://127.0.0.1:8000/docs`; OpenAPI: `http://127.0.0.1:8000/openapi.json`; contrato compartido: `docs/api-contracts.md` del backend.
- **El OpenAPI servido y `docs/api-contracts.md` son la fuente de verdad.** Si este documento difiere del contrato vigente, no adivines: inspecciona el contrato actual y comunica la discrepancia.

#### Endpoints documentados (API v0.1.0)

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/api/v1/health` | Estado del servicio |
| GET | `/api/v1/observations` | Consulta de observaciones |

Parámetros de `GET /api/v1/observations`: `sensor` (MODIS o VIIRS, opcional) y `limit` (entero 1–1000, por defecto 100). La versión documentada no tiene paginación; `total_matching` permite detectar truncamiento. La colección contiene `data`, `count`, `total_matching` y `data_provenance`.

Cada observación contiene: `observation_id`, `sensor` (MODIS/VIIRS), `latitude`, `longitude`, `acquired_at` (ISO 8601 UTC), `frp_mw` (MW o `null`), `confidence_raw` (entero o string) y `source`.

#### Discrepancia conocida con la plantilla

El cliente HTTP exportado de la plantilla (`src/services/fastapiClient.ts`) asume una respuesta `{ metadata: { count, total_matching, data_provenance }, results: [...] }`, que **no coincide** con la colección documentada (`data`, `count`, `total_matching`, `data_provenance`). Al portar, el adaptador debe consumir la forma real del OpenAPI vigente; la UI no cambia. Si al integrar se detecta que el backend difiere de `docs/api-contracts.md`, se registra la discrepancia y se coordina con el equipo backend (no se altera el contrato).

#### Correcciones de integridad obligadas al portar

1. `frp_mw` nulo permanece nulo y se muestra «No disponible» (se elimina el fallback `|| 10.0` de la plantilla).
2. `brightness_k`, `satellite`, `department`, `municipality`, `daynight` ausentes se muestran «No disponible» / «Pendiente de datos del backend» (se eliminan los rellenos `|| 320`, `'Terra'`, `'Antioquia'`, etc.).
3. `observation_id` ausente no se genera al azar: es un caso de error de validación del adaptador.
4. La forma de respuesta se parsea según el OpenAPI real, no según el fixture del modal exportado.
5. La procedencia (`data_provenance`, `source`) se conserva y muestra tal cual (p. ej. `synthetic_demo` debe etiquetarse si el backend la entrega).

#### Dependencias solicitadas al backend (contratos futuros)

La tabla completa y priorizada está en `ROADMAP.md` (sección «Dependencias y solicitudes al equipo backend»): campos FIRMS nativos (`satellite`, `daynight`, `brightness_k`, `department`, `municipality`), paginación/cursor, y el contrato de publicación de artefactos del AI-Pipeline.

### 7. Stack frontend previsto

- React con TypeScript estricto (componentes funcionales y hooks).
- Vite como herramienta de desarrollo y compilación.
- Tailwind CSS para estilos y tokens; la paleta referencial es la de la plantilla (fondo `#060b13`/`#070e1a`/`#08111e`, grises slate, acentos ámbar/naranja y cian, estados emerald/rojo según sección).
- MapLibre GL JS para cartografía (capas WebGL, worker habilitado, gestión de limpieza de instancias).
- Apache ECharts o gráficos web ligeros determinados al implementar; el compromiso es visual: las gráficas deben reproducir el diseño de la plantilla.
- TanStack Query para consultas, caché y estados de servidor; Zustand para estado global de interfaz (filtros compartidos, pestaña activa, selección). Sin React Router en v1 (navegación por pestañas; HashRouter queda registrado como extensión futura opcional).
- Vitest + React Testing Library y ESLint.

La integración es modular: los componentes de presentación no contienen llamadas HTTP ni reglas de transformación de datos; el cliente HTTP, la serialización y el manejo de errores viven en `services/`.

## Tarea

Ante cada solicitud de desarrollo:

1. Lee `AGENTS.md`, este archivo y `ROADMAP.md`; al implementar módulos de interfaz, tienes el directorio `../prometheus-ignis` como referencia congelada (componentes y textos).
2. Inspecciona el estado real del repositorio, sus dependencias, scripts y estructura antes de asumir que algo existe.
3. Identifica objetivo, módulo afectado, criterios de aceptación y dependencias con backend o pipeline.
4. Verifica el contrato API vigente antes de crear tipos, servicios o adaptadores.
5. Propón un plan breve antes de cambios que afecten arquitectura, navegación, dependencias, contratos o varios módulos.
6. Implementa el cambio mínimo coherente con la interfaz congelada; transforma solo la capa de servicios cuando la UI lo exija.
7. Añade o actualiza pruebas para el comportamiento modificado.
8. Ejecuta las verificaciones pertinentes y reporta resultados reales.
9. Actualiza documentación cuando cambien decisiones, comandos, contratos o comportamiento.
10. Al finalizar, entrega un resumen técnico claro y enumera los archivos modificados.

### Prioridad inicial del producto

El primer flujo vertical es el **Mapa Territorial conectado al backend real**:

1. Levantar el backend local y configurar `VITE_API_BASE_URL`.
2. Comprobar `/api/v1/health` (indicador pasivo de conexión).
3. Consultar `/api/v1/observations` respetando `sensor` y `limit`.
4. Validar y adaptar la colección recibida según este contexto (armonización v1.0, derivación de fechas, campos ausentes).
5. Renderizar las observaciones en MapLibre con las capas congeladas (puntos por sensor, halo, heatmap FRP).
6. Filtrar en cliente y verificar que la línea de tiempo cambia los puntos visibles.
7. Mostrar el panel de detalle al seleccionar una observación.
8. Comunicar truncamiento, vacíos, errores y procedencia tal como llegan del backend.

No puedes descargar el dataset completo en memoria sin límite: respeta `limit` máximo del contrato y comunica truncamiento si `count < total_matching`.

## Restricciones y reglas

### Reglas científicas (núcleo duro, no negociable)

- MODIS y VIIRS son instrumentos distintos y no intercambiables. Nunca se suman sus conteos para reportar «incendios»; los conteos son detecciones u observaciones, por sensor.
- Una observación no equivale a un incendio independiente; no se agrupan detecciones en eventos sin regla aprobada.
- La armonización de confianza y los índices del producto se calculan **exclusivamente** con las fórmulas oficiales v1.0 (sección 3). Otras conversiones están prohibidas y su cambio requiere decisión científica documentada.
- `confidence_raw` viaja intacto y visible junto al nivel armonizado.
- `frp_mw` nulo es «No disponible»; ningún valor por defecto. FRP se expresa en MW.
- Coordenadas en grados decimales validados; GeoJSON `[longitude, latitude]`.
- `acquired_at` es adquisición en UTC; se conserva el instante y no se mezcla con hora local en filtros.
- Cero resultados ≠ error ≠ falta de cobertura ≠ truncamiento; cada estado tiene su representación.
- La procedencia (`data_provenance`, `source`) se conserva y muestra; el frontend no re-atribuye datos ni presenta métricas sin fuente.
- La resolución nominal (~375 m/~1 km) no se presenta como tamaño exacto del incendio ni como precisión posicional garantizada.
- No se inventan datos: sin dataset sintético de producto, sin rellenos por defecto, sin identificadores generados. Todo lo que muestra la UI viene del backend, de la armonización v1.0 o es contenido metodológico documentado (matriz 5×5, glosario, fichas del pipeline).

### Reglas de interfaz y experiencia

- La interfaz congelada es la fuente visual: no rediseñar pantallas, leyendas, jerarquías ni microcopy sin decisión del equipo.
- El mapa es el elemento central; los paneles apoyan sin ocultarlo innecesariamente.
- Responsive y usable con teclado: foco visible, etiquetas semánticas, controles accesibles.
- Estados de carga, error, vacío, truncamiento y procedencia siempre presentes.
- El color nunca es el único diferenciador de sensores o estados: leyenda, iconos y texto lo acompañan.
- Leyenda persistente de capas y categorías del mapa.
- Grandes volúmenes únicamente con capas WebGL de MapLibre (una source GeoJSON); nunca marcadores DOM por punto.
- Todos los controles visibles funcionan en v1. Control dependiente de un campo no disponible en el conjunto: se informa «No disponible» y no actúa como si filtrara.
- Sin animaciones o capas decorativas que sugieran precisión o resultados inexistentes.

### Reglas de integración

- URL base únicamente por `VITE_API_BASE_URL` (documentada en `.env.example`); sin URL codificada en componentes y sin panel de configuración.
- Cliente HTTP centralizado con timeout y manejo de errores (red, HTTP, `422`, cancelación).
- El OpenAPI vigente manda sobre cualquier ejemplo offline (incluidos los del modal exportado de la plantilla).
- No llames a endpoints que no existan todavía; para módulos pendientes de contrato, la UI muestra su estado «En desarrollo».
- No cambies contratos del backend desde el frontend; registra discrepancias y coordina.
- Evita solicitudes duplicadas; conserva filtros relevantes durante la sesión.

### Reglas de seguridad y calidad

- Nunca incluyas tokens, claves, credenciales o secretos en código, logs, fixtures o documentación versionada; las variables `VITE_` son públicas.
- No uses `dangerouslySetInnerHTML` con contenido externo.
- No desactives TypeScript, ESLint, pruebas o validaciones para ocultar errores.
- No afirmes que una prueba, compilación o integración pasó si no se ejecutó.

## Formato de salida

Al terminar cada tarea, responde en español con esta estructura:

### Resumen
- Qué se implementó o corrigió.
- Qué necesidad del usuario o criterio de aceptación resuelve.

### Archivos modificados
- Lista de archivos creados, modificados o eliminados, con una descripción breve.

### Decisiones técnicas
- Decisiones relevantes y su justificación.
- Supuestos realizados y aspectos que requieren confirmación.

### Verificación
- Comandos exactos ejecutados.
- Resultado real de cada comando.
- Pruebas que no pudieron ejecutarse y motivo.

### Integración y pendientes
- Endpoints o contratos utilizados.
- Dependencias con backend u otros módulos.
- Riesgos, limitaciones y siguientes pasos.

No afirmes que el trabajo está completo si quedan errores relevantes, contratos sin confirmar o verificaciones pendientes. Distingue explícitamente entre implementación terminada, validación técnica y validación científica.
