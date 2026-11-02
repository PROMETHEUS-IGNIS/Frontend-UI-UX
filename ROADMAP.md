# ROADMAP.md — PROMETHEUS IGNIS (Frontend)

## 1. Propósito y alcance

Este documento define el plan de construcción del frontend de **PROMETHEUS IGNIS**, plataforma de exploración territorial y análisis comparativo de detecciones de focos de calor de los instrumentos MODIS y VIIRS, con alcance territorial **Antioquia → Colombia**.

El producto se construye sobre una **interfaz congelada** (la propuesta aprobada y exportada a `../prometheus-ignis`, descrita en `PROJECT_CONTEXT.md`) y se implementa como una **aplicación de una sola página con navegación por pestañas, sin router en v1** (HashRouter queda registrado como extensión futura opcional).

### Objetivo del producto

- Consumir **exclusivamente** los datos del Backend-API (`/api/v1/health`, `/api/v1/observations`) configurado por `VITE_API_BASE_URL`; sin modo demostración ni dataset sintético de producto.
- Explorar geográficamente las observaciones (Mapa Territorial) con filtros en cliente, leyenda, capas WebGL por sensor, heatmap FRP y detalle por observación.
- Reproducir la evolución temporal con una **línea de tiempo funcional** que filtra los puntos del mapa por `acq_date`.
- Presentar analítica descriptiva responsable (conteos separados por sensor, recurrencia v1.0, FRP, evolución mensual, día/noche, ficha técnica).
- Situar la gestión del riesgo con la Matriz 5×5 oficial (P = Amenaza × Consecuencia) sobre zonas documentadas.
- Exponer las fichas publicadas del AI-Pipeline (Laboratorio IA) sin ejecutar nada en el navegador.
- Comunicar siempre procedencia, truncamiento, errores, vacío y disponibilidad de campos.
- Exportar CSV de los registros descargados y filtrados.

### Alcance de esta versión

El backend disponible (API v0.1.0) expone:

- `GET /api/v1/health`
- `GET /api/v1/observations?sensor=MODIS|VIIRS&limit=1..1000`

La respuesta de observaciones contiene `data`, `count`, `total_matching`, `data_provenance`, y cada registro `observation_id`, `sensor`, `latitude`, `longitude`, `acquired_at`, `frp_mw` (puede ser `null`), `confidence_raw`, `source`.

**Sin paginación en v0.1.0:** si `count < total_matching`, la interfaz lo comunica explícitamente como conjunto truncado. El cliente consulta como máximo el `limit` permitido por el contrato; nunca intenta «paginar» contra un endpoint inexistente.

**Excluido por decisión del equipo:** pestaña y modal «FastAPI Lab»; capas de límites administrativos; interruptor «Demostración / Lab Real»; dataset sintético de producto. Las fixtures solo existen en el entorno de pruebas y están etiquetadas.

Los filtros avanzados operan **en cliente** sobre el conjunto descargado; migrar filtros a servidor únicamente cuando exista contrato.

---

## 2. Organización del trabajo con agentes

Se recomienda asignar agentes por responsabilidad y mantener un único agente coordinador que integre los cambios.

| Rol de agente | Responsabilidad |
|---|---|
| Agente coordinador / integrador | Mantener el roadmap, dividir trabajo, resolver conflictos, revisar contratos e integrar ramas. |
| Agente de arquitectura | Estructura React, pestañas, configuración, estado global y decisiones técnicas transversales. |
| Agente de diseño UI | Reproducción fiel de la interfaz congelada, tokens visuales, accesibilidad y responsive. |
| Agente de integración API | Cliente HTTP, tipos, validación de respuestas, armonización v1.0, estados de carga/error y compatibilidad con backend. |
| Agente geoespacial | Mapa MapLibre, capas WebGL, simbología, heatmap, timeline funcional y controles de navegación. |
| Agente de analítica | KPIs y agregaciones con las definiciones oficiales v1.0; advertencias metodológicas. |
| Agente de QA | Pruebas unitarias, integración, accesibilidad, regresión y verificación de build. |
| Agente de documentación | README, instrucciones de instalación, decisiones técnicas y documentación de componentes. |

### Reglas para delegar

1. Cada tarea debe tener un alcance acotado, archivos o módulos objetivo y criterios de aceptación.
2. Antes de modificar código, el agente debe revisar `PROJECT_CONTEXT.md`, `AGENTS.md` y este roadmap; la referencia visual es el directorio congelado `../prometheus-ignis`.
3. Los agentes no deben modificar simultáneamente el mismo archivo sin coordinación explícita.
4. Cada tarea termina con un resumen de archivos modificados, decisiones, pruebas ejecutadas y pendientes.
5. No se permite inventar endpoints, campos, datos ni resultados para completar una interfaz.
6. El agente coordinador es responsable de verificar la integración; la fidelidad visual con la plantilla congelada es parte de la aceptación.

---

## 3. Fases de desarrollo

## Fase 0 — Preparación y definición técnica

**Objetivo:** dejar el repositorio listo para un desarrollo consistente y verificable.

### HU-00.1 — Como equipo de desarrollo, quiero una base de proyecto reproducible para que todos los agentes trabajen con la misma configuración.

**Tareas delegables**
- **A0.1 — Arquitectura:** inspeccionar el repositorio y confirmar que no existan implementaciones previas que deban conservarse.
- **A0.2 — Arquitectura:** inicializar React + TypeScript + Vite.
- **A0.3 — Arquitectura:** configurar la estructura de carpetas por dominios (`app`, `components`, `features`, `services`, `stores`, `types`, `hooks`, `utils`) y alias de imports.
- **A0.4 — Arquitectura:** configurar Tailwind CSS con los tokens de la plantilla congelada (paleta `#060b13`/`#070e1a`/`#08111e`, slate, ámbar/naranja, cian) y estilos globales.
- **A0.5 — QA:** configurar ESLint, TypeScript strict mode y Vitest.
- **A0.6 — Documentación:** definir scripts de `package.json` (`dev`, `build`, `lint`, `typecheck`, `test`), `.env.example` con `VITE_API_BASE_URL` y requisitos de Node/npm.
- **A0.7 — Integrador:** fijar dependencias en el lockfile y comprobar instalación limpia.

**Criterios de aceptación**
- El proyecto instala dependencias desde un clon limpio.
- `npm run dev` inicia la aplicación; `npm run build` genera la compilación de producción.
- `npm run lint`, `npm run typecheck` y `npm run test` están definidos y ejecutables.
- No hay errores TypeScript ni lint en el código inicial.
- `.env.example` documenta `VITE_API_BASE_URL` (sin secretos).

### HU-00.2 — Como desarrollador, quiero una estructura modular para que cada agente pueda trabajar sin acoplar toda la aplicación.

**Tareas delegables**
- **Arquitectura:** crear la estructura por dominios y definir convenciones de nombres, imports y ubicación de tipos (`types/api` refleja el contrato; `types/domain` solo cuando aporte).
- **Arquitectura:** definir el shell de aplicación (una sola página con pestañas; sin router) y las convenciones de estado compartido con Zustand y servidor con TanStack Query.
- **QA:** confirmar que no queda configuración de rutas pendiente (no se configura React Router en v1).
- **Documentación:** documentar decisiones técnicas relevantes.

**Criterios de aceptación**
- La estructura y las decisiones (pestañas sin router, estado por capas) están documentadas en el README o guía de arquitectura.
- Ningún componente de presentación contiene llamadas HTTP ni reglas de transformación de datos.
- No se introducen abstracciones innecesarias.

**Entregable de fase:** aplicación base ejecutable, sistema de pestañas esquelético, herramientas de calidad y documentación mínima.

---

## Fase 1 — Sistema visual y navegación

**Objetivo:** reproducir fielmente la identidad visual y el esqueleto navegable de la interfaz congelada.

### HU-01.1 — Como usuario, quiero reconocer la interfaz científica aprobada para entender el propósito de la plataforma.

**Tareas delegables**
- **Diseño UI:** implementar el Header congelado: logo con núcleo de fuego + punto cian, título con degradado ámbar, badge cian «MODIS · VIIRS», subtítulo institucional de Semillero de Astronomía ITM.
- **Diseño UI:** navegación por pestañas (barra horizontal `md+`, barra compacta en móvil) para los 4 módulos: Mapa Territorial, Analítica & Tiempos, Matriz 5×5, Laboratorio IA.
- **Diseño UI:** indicador pasivo de conexión con el backend (estado disponible/no disponible, sin configuración de URL) y botón de exportación CSV con contador de registros visibles.
- **Diseño UI:** modal Glosario con los 7 términos canónicos y sus fuentes.
- **QA:** comprobar contraste, foco visible, navegación por teclado y estados hover/focus/disabled.

**Criterios de aceptación**
- La cabecera y la navegación reproducen la plantilla congelada sin añadidos (sin pestaña FastAPI, sin conmutador Demostración/Lab Real).
- La identidad visual es consistente entre pestañas.
- Todos los controles del header son accesibles por teclado y funcionan.
- No hay rutas ni pantallas extra.

### HU-01.2 — Como desarrollador, quiero el shell de estado compartido para que los 4 módulos consuman la misma sesión.

**Tareas delegables**
- **Arquitectura:** definir el estado global de interfaz en Zustand: pestaña activa, filtros compartidos, selección de observación, mensaje de estado de conexión.
- **Arquitectura:** definir el estado de servidor en TanStack Query: observaciones (con `sensor`/`limit`), health, reintentos y cancelación. Un solo pool por sesión.
- **Integración:** comportamiento de la app cuando el backend no responde (estados en línea, sin datos de relleno).

**Criterios de aceptación**
- Cambiar de pestaña conserva filtros, conexión y resultados (no hay reinicios de estado compartido).
- Ninguna pestaña muestra datos si el pool está vacío por error; muestra su estado correspondiente.
- El shell no duplica estado remoto en Zustand.

**Entregable de fase:** sistema visual reutilizable + shell navegable con estado compartido.

---

## Fase 2 — Integración con la API y modelo de datos

**Objetivo:** conectar el frontend con el backend real y gestionar procedencia, truncamiento y estados de datos. Una única fuente de datos: el Backend-API.

### HU-02.1 — Como usuario, quiero consultar las observaciones disponibles en el backend para explorar datos reales.

**Tareas delegables**
- **Integración API:** cliente HTTP centralizado con `VITE_API_BASE_URL` (timeout, manejo de red/HTTP/`422`/cancelación; sin URL codificada ni panel de configuración).
- **Integración API:** consumir `GET /api/v1/observations` con `sensor` y `limit` según el OpenAPI vigente; parsear la forma real de la respuesta (`data`, `count`, `total_matching`, `data_provenance`).
- **Integración API:** adaptador hacia el modelo de la interfaz con las reglas de `PROJECT_CONTEXT.md`:
  - derivación de `acq_date`/`acq_time` desde `acquired_at` (UTC; nulos si no es parseable);
  - armonización de confianza **solo** con las reglas oficiales v1.0 (sección 3.3);
  - `frp_mw` nulo permanece nulo («No disponible» en UI); prohibidos los fallbacks numéricos de la plantilla (`|| 10.0`, `|| 320.0`);
  - `satellite`, `daynight`, `brightness_k`, `department`, `municipality` ausentes = «No disponible»/«Pendiente de datos del backend»; prohibido rellenarlos;
  - `concordance` = `single_sensor` en v1.0;
  - `observation_id` ausente es error de validación, no un id generado.
- **Integración API:** estrategia de descarga única por sesión respetando el `limit` máximo del contrato (v1.0: 1000) y detección de truncamiento con `total_matching`.
- **QA:** pruebas con respuestas válidas, listas vacías, `422`, errores HTTP, timeout, `frp_mw: null`, `confidence_raw` texto y numérico, y respuesta truncada.

**Criterios de aceptación**
- El frontend consume el endpoint conforme al contrato oficial; no se asumen propiedades no documentadas.
- Los errores de red, `422`, respuestas vacías y truncamiento se distinguen correctamente en UI.
- La armonización y derivaciones se calculan exactamente con las reglas v1.0; `confidence_raw` viaja intacto.
- Los fixtures solo existen en `tests`/dev, etiquetados, nunca en producción.

### HU-02.2 — Como usuario, quiero conocer la procedencia y completitud del conjunto consultado para interpretar correctamente los resultados.

**Tareas delegables**
- **Diseño UI:** mostrar `data_provenance` y `source` tal como los entrega el backend; si el backend reporta `synthetic_demo` u otra procedencia de demostración, etiquetarla claramente en la interfaz.
- **Diseño UI:** aviso de truncamiento cuando `count < total_matching` (con orientación para ampliar/cambiar filtros).
- **QA:** contrastar los estados vacío/error/cero resultados/truncado.

**Criterios de aceptación**
- Procedencia visible y fiable; el frontend no re-atribuye datos.
- Truncamiento explícito; cero resultados no se confunde con error.

### HU-02.3 — Como usuario, quiero conocer el estado del servicio para saber si la información puede consultarse.

**Tareas delegables**
- **Integración API:** consumir `GET /api/v1/health`.
- **Diseño UI:** alimentar el indicador pasivo del header; sin modales de configuración.
- **QA:** backend disponible, no disponible, respuesta inesperada.

**Criterios de aceptación**
- El estado del backend se comunica sin bloquear la interfaz.
- La aplicación permite reintentar cuando falla la conexión.

**Entregable de fase:** cliente API tipado y observaciones reales disponibles en toda la app, con procedencia y estados de datos tratados correctamente.

---

## Fase 3 — Mapa Territorial (módulo central)

**Objetivo:** entregar el módulo congelado del mapa con la línea de tiempo funcional.

### HU-03.1 — Como usuario, quiero visualizar las observaciones sobre el mapa con la simbología aprobada para explorar su distribución espacial.

**Tareas delegables**
- **Geoespacial:** integrar MapLibre GL JS (worker habilitado, limpieza de instancia al desmontar, `resize` correcto) centrado en Antioquia [-75.6, 6.4], zoom 7.
- **Geoespacial:** 4 basemaps (OpenFreeMap Liberty, Esri Satélite + etiquetas, Esri Topográfico, Carto Oscuro) con cambio de estilo y re-agregación de capas de datos; atribuciones de proveedores.
- **Geoespacial:** source GeoJSON única con las observaciones; capas WebGL: puntos por sensor (VIIRS `#ea580c`, MODIS `#fbbf24`, tamaños por sensor), halo por sensor (`#ff5722` / `#f59e0b`), borde blanco (cian `#38bdf8` solo si `concordance = coincident_high`, inactivo en v1.0), heatmap FRP con la rampa de colores de la plantilla.
- **Geoespacial:** panel de capas (Puntos Satelitales, Densidad Térmica FRP) y leyenda persistente (VIIRS ~375 m / MODIS ~1000 m) coherente con las capas visibles.
- **Geoespacial:** vistas rápidas `flyTo` (Antioquia, Colombia, Valle de Aburrá, Bajo Cauca, Urabá) y atribución compacta.
- **Exclusión explícita:** NO implementar capas de límites administrativos (excluidas por decisión del equipo; extensión futura con geometrías oficiales IGAC/DANE).
- **QA:** validar orden `[longitude, latitude]`, rangos de coordenadas, cambio de basemap, rendimiento del `source.setData` y comportamiento sin observaciones.

**Criterios de aceptación**
- Cada observación usa longitud/latitud correctas y GeoJSON `[longitude, latitude]`.
- MODIS y VIIRS se distinguen visualmente y la leyenda coincide con lo visible.
- Sin marcadores DOM por punto; las capas actualizan con `setData`.
- El mapa presenta estados útiles cuando no hay observaciones o no hay conexión.

### HU-03.2 — Como usuario, quiero una línea de tiempo funcional para estudiar la evolución temporal de las detecciones.

**Tareas delegables**
- **Geoespacial:** controles prev/play/pause/next, velocidad 1×/2×/5× (intervalo de la plantilla: `max(200, 1000/velocidad)` ms) y scrubber sobre los días únicos del conjunto filtrado (`acq_date`).
- **Geoespacial:** el paso temporal activo **filtra los puntos visibles** del mapa (estado compartido por encima de las vistas; el histograma diario base se calcula sobre el conjunto filtrado).
- **Diseño UI:** histograma diario (barras) con tooltip de conteo por día, etiqueta «Paso temporal: X de N» y badge científico permanente («La ausencia de datos en un paso orbital no equivale a ausencia de incendios»).
- **QA:** reproducción/pausa, límites del scrubber, cambio de filtros (re-cálculo de días), restablecimiento del paso cuando el conjunto cambia, rendimiento.

**Criterios de aceptación**
- El play/scrubber cambia de forma observable los puntos del mapa por `acq_date`.
- El histograma refleja el conjunto filtrado y el tooltip indica conteo real.
- Al cambiar filtros o dataset, la posición temporal se ajusta sin romper el control.
- Los controles se deshabilitan coherentemente (sin pasos, sin datos).

### HU-03.3 — Como usuario, quiero seleccionar una observación para consultar sus atributos.

**Tareas delegables**
- **Geoespacial:** interacción de selección sobre la capa de puntos (hover con cursor, clic, cierre, cambio de selección).
- **Diseño UI:** panel de inspección congelado (derecha del mapa): municipio/departamento (si existen), sensor + satélite (si existe), `acq_date`; FRP con unidad o «No disponible»; confianza con nivel armonizado + `confidence_raw`; temperatura de brillo si existe; hora de adquisición UTC; coordenadas; descripción instrumental del sensor (texto canónico de la plantilla).
- **QA:** valores nulos y campos no disponibles; cierre con teclado; no se muestran datos inexistentes.

**Criterios de aceptación**
- Muestra solo atributos realmente disponibles; los ausentes se representan «No disponible»/«Pendiente de datos del backend».
- `frp_mw = null` nunca se muestra como 0 ni otro valor.
- `confidence_raw` intacto junto al nivel armonizado; fecha legible con referencia UTC.

### HU-03.4 — Como usuario, quiero filtrar observaciones para enfocar la exploración.

**Tareas delegables**
- **Diseño UI:** panel de filtros congelado: alternador Modo Fácil / Filtros Pro; contador «focos encontrados / total» con reset; búsqueda por municipio/departamento/id; filtros geográficos (departamento/municipio) con cascada; presets temporales (Temporada Seca Ene–Mar 2025, Año 2025, Año 2024, todo el histórico) y rango manual; sensor (Ambos / VIIRS 375 m / MODIS 1 km); nivel de confianza (Todas/Alta/Nominal/Baja); horario orbital (Todos/Diurno/Nocturno); slider FRP mínimo.
- **Integración:** los filtros aplican en cliente sobre el pool descargado; el sensor puede además afinar la consulta al backend (`sensor=`) o filtrar en cliente (decisión de implementación documentada; en cualquier caso misma UX).
- **Integrador:** política de campos no disponibles: si el conjunto no incluye `department`/`municipality`/`daynight`, el control correspondiente se marca «No disponible en este conjunto» y no altera resultados sin avisar.
- **QA:** validación de combinaciones, reset, estados vacíos coherentes y visibilidad de filtros aplicados.

**Criterios de aceptación**
- Los controles visibles funcionan (o se declaran «No disponible» con explicación).
- Los filtros son visibles y restablecibles; el contador refleja el resultado real.
- Ningún filtro aparenta modificar datos cuando en realidad no puede.

**Entregable de fase:** módulo central completo e interactivo, con timeline funcional y ficha de detalle fiel a la plantilla.

---

## Fase 4 — Analítica & Tiempos

**Objetivo:** el panel congelado de resúmenes exploratorios, calculados sobre el conjunto descargado y filtrado, con las definiciones oficiales v1.0.

### HU-04.1 — Como usuario, quiero indicadores descriptivos con definiciones explícitas para obtener una visión general del conjunto.

**Tareas delegables**
- **Analítica:** implementar las 4 tarjetas KPI congeladas: detecciones VIIRS (con nota de sensibilidad ~375 m), detecciones MODIS (serie ~1 km), Índice de Recurrencia 0–100 con nivel oficial (fórmula de `PROJECT_CONTEXT.md` §3.1: días con actividad, intensidad y FRP máxima) y FRP promedio/máxima.
- **Analítica:** tooltip/nota metodológica por KPI (fórmula, universo, advertencias); universo = conjunto descargado; FRP promedio/máx solo sobre registros con FRP disponible.
- **Diseño UI:** cabecera con zona evaluada (municipio → departamento → conjunto) y exportación CSV del conjunto filtrado.
- **QA:** contrastar valores con cálculos independientes; probar conjuntos vacíos y truncados.

**Criterios de aceptación**
- Cada KPI muestra definición y universo; conteos siempre etiquetados como detecciones/observaciones, nunca «incendios»; jamás se suman MODIS+VIIRS en un total.
- La recurrencia se calcula con la fórmula v1.0 exacta y se comunica que no es probabilidad futura.
- Si el conjunto está truncado, la card lo indica.

### HU-04.2 — Como usuario, quiero la evolución mensual y los pases día/noche para identificar patrones exploratorios.

**Tareas delegables**
- **Analítica:** agregación mensual en cliente (mes adquisición, conteo total, MODIS, VIIRS, FRP promedio) solo sobre el conjunto descargado.
- **Diseño UI:** histograma mensual congelado (barras agrupadas VIIRS/MODIS, tooltip con conteo y FRP promedio, leyenda); estados vacíos.
- **Diseño UI:** distribución por horario orbital (pases diurnos/nocturnos) condicionada a disponibilidad de `daynight`; si el campo no está disponible en el conjunto, las tarjetas muestran «Pendiente de datos del backend» y no valores inventados.
- **Diseño UI:** nota de hallazgos del AI-Pipeline (importancia de `acq_hour`/`is_noche`) con la atribución correcta al pipeline, solo si existen artefactos publicados.
- **QA:** intervalos, fechas inválidas, conjuntos pequeños, meses sin datos.

**Criterios de aceptación**
- Las gráficas indican universo (n de registros) y aclaran el truncamiento si aplica.
- No se infieren tendencias globales a partir de una muestra limitada.
- Día/noche sin `daynight` no muestra números fabricados.

### HU-04.3 — Como usuario, quiero la comparación técnica de sensores para entender sus diferencias instrumentales.

**Tareas delegables**
- **Diseño UI:** ficha técnica congelada: tabla Sensor/Plataformas/Resolución/Implicación territorial (VIIRS ~375 m: Suomi-NPP, NOAA-20/21; MODIS ~1 km: Terra, Aqua), referencias Giglio et al. (2016) y Schroeder et al. (2014).
- **QA:** verificar que no existan conversiones implícitas o equivalencias engañosas entre sensores.

**Criterios de aceptación**
- La resolución nominal no se presenta como tamaño de incendio ni precisión exacta.
- La comparación declara universo y diferencias instrumentales.

**Entregable de fase:** panel analítico fiel a la plantilla, con KPIs v1.0 documentados y advertencias metodológicas activas.

---

## Fase 5 — Matriz 5×5

**Objetivo:** el módulo congelado de gestión del riesgo territorial, con la definición oficial v1.0 y zonas documentadas.

### HU-05.1 — Como usuario, quiero interactuar con la matriz 5×5 para ubicar la gestión del riesgo de una zona.

**Tareas delegables**
- **Diseño UI:** matriz 5×5 congelada: ejes etiquetados (Amenaza horizontal 1..5 con etiquetas Muy bajo→Muy alto; Consecuencia vertical), producto `P = A × C` por celda, colores de bandas oficiales (≤4 esmeralda, ≤9 amarillo, ≤15 naranja, >15 rojo) con texto y nivel, no solo color.
- **Diseño UI:** interactividad: clic en celda y sliders A/C; caja de producto; selector de zonas documentadas (Valle X conceptual, Bajo Cauca, Urabá Norte, Valle de Aburrá).
- **Diseño UI:** perfil de zona: justificación de amenaza/consecuencia, elementos expuestos (población, infraestructura crítica, áreas protegidas, accesibilidad), recomendaciones preventivas y advertencia metodológica canónica («no estima riesgo probabilístico futuro...»).
- **QA:** accesibilidad de la matriz (teclado, foco), bandas correctas, estado inicial.

**Criterios de aceptación**
- El cálculo y los umbrales corresponden exactamente a §3.2 de `PROJECT_CONTEXT.md`.
- Cada celda es accesible y anuncia su producto y nivel por texto.
- Las recomendaciones mantienen el pie «no son instrucciones operativas para emergencias».

### HU-05.2 — Como usuario, quiero conocer la metodología detrás de la matriz para evaluar su validez.

**Tareas delegables**
- **Documentación:** notas metodológicas visibles (marco UNDRR, naturaleza ordinal, justificaciones por zona).
- **QA:** revisar que no se interprete como pronóstico ni probabilidad.

**Criterios de aceptación**
- No hay puntuaciones sintéticas ni rankings adicionales a los definidos.
- Las limitaciones se muestran junto a la matriz.

**Entregable de fase:** matriz explicativa congelada, funcional y metodológicamente documentada.

---

## Fase 6 — Laboratorio IA

**Objetivo:** el módulo congelado que documenta los artefactos publicados del AI-Pipeline, sin ejecución en navegador ni datos inventados.

### HU-06.1 — Como usuario, quiero consultar las fichas de los modelos del pipeline para entender qué han preparado los responsables de ciencia.

**Tareas delegables**
- **Arquitectura:** acordar con el equipo del pipeline el mecanismo de publicación de artefactos (archivo versionado del pipeline o endpoint del backend) y su procedencia (versión, fecha/commit, dataset).
- **Diseño UI:** implementar la estructura congelada: selector de modelos, banner ético/científico (anti-fuga, honestidad epistémica, balance de clases), ficha técnica (target, versión, algoritmo, muestras, dataset, métrica base), tarjetas de métricas (CV F1, CV accuracy, recall minoritaria, muestras), importancia por permutación con descripciones, variables excluidas por anti-fuga, matriz de confusión documentada, auditoría de ingesta y advertencia de cautela.
- **Diseño UI:** control de reentrenamiento bloqueado (deshabilitado con el aviso de política científica; listado del comando de pipeline `python -m src.main` como referencia).
- **Integrador:** mientras no existan artefactos publicados reales, el módulo muestra «En desarrollo» y no inventa métricas.
- **QA:** verificar que cada valor mostrado proviene de un artefacto con procedencia.

**Criterios de aceptación**
- Ninguna métrica se muestra sin artefacto publicado y trazable.
- La separación observaciones (datos) vs resultados del pipeline es explícita.
- No hay ejecución ni reentrenamiento en el navegador.

### HU-06.2 — Como equipo, queremos la conexión con artefactos reales del pipeline para que el módulo sea veraz.

**Tareas delegables**
- **Integrador:** contrato y prueba end-to-end con el pipeline (publicación → consumo → render).
- **QA:** verificación de versión/fecha/dataset correctos en UI.

**Criterios de aceptación**
- Las fichas publicadas reflejan la última ejecución trazable del pipeline.
- La UI distingue claramente la procedencia del artefacto de los datos de observación.

**Entregable de fase:** laboratorio con cada artefacto trazable; mientras tanto, vista «En desarrollo» explícita.

---

## Fase 7 — Calidad, rendimiento y preparación de entrega

**Objetivo:** asegurar estabilidad, comprensión y una demostración reproducible con backend real.

### HU-07.1 — Como usuario, quiero una aplicación robusta para explorar información sin estados confusos.

**Tareas delegables**
- **QA:** pruebas unitarias, integración y regresión (incluida la armonización v1.0 y las reglas del adaptador).
- **QA:** estados de carga, vacío, error, timeout, truncamiento y recuperación.
- **Geoespacial:** rendimiento del mapa con el volumen real del backend (limit 1000); limpieza de listeners/instancias al desmontar.
- **Arquitectura:** revisar caché, solicitudes duplicadas y persistencia de sesión entre pestañas.
- **Diseño UI:** responsive y accesibilidad básica en los 4 módulos y modales.

**Criterios de aceptación**
- Build de producción exitoso; sin errores críticos de consola en los flujos principales.
- El mapa no deja instancias o listeners duplicados al cambiar de pestaña.
- Los errores se comunican en lenguaje comprensible.

### HU-07.2 — Como equipo, queremos una demostración reproducible para presentar el proyecto.

**Tareas delegables**
- **Documentación:** README con instalación, configuración de `VITE_API_BASE_URL`, comandos y arquitectura (requisito: backend en ejecución antes de la demo).
- **Integrador:** procedimiento de arranque: Backend-API → (opcional AI-Pipeline artifacts) → frontend.
- **QA:** checklist de demo: backend corriendo → env var configurada → indicador de conexión activo → mapa con observaciones → timeline funcional → detalle → analítica → matriz → laboratorio. Sin datos de relleno en ninguna pantalla.
- **QA:** verificar truncamiento y procedencia en la demo si el conjunto supera `limit`.

**Criterios de aceptación**
- Un integrante nuevo levanta frontend + backend siguiendo el README.
- La demo corre con datos reales del backend (la app no muestra datos si el servicio no está disponible).
- Las funciones pendientes (extensiones futuras) se identifican como tales.

**Entregable de fase:** versión candidata para demo, documentación y checklist de validación.

---

## 4. Priorización y secuencia recomendada

| Prioridad | Fases / HU | Resultado esperado |
|---|---|---|
| P0 — Imprescindible | Fase 0, Fase 1, HU-02.1–02.3, HU-03.1, HU-03.3 | Aplicación navegable conectada al backend real con el mapa funcional. |
| P0 — Imprescindible (módulo central) | HU-03.2, HU-03.4 | Línea de tiempo funcional y filtros completos. |
| P1 — Importante | Fase 4 | Analítica descriptiva con fórmulas oficiales v1.0. |
| P1 — Importante | Fase 5 | Matriz 5×5 congelada funcional. |
| P2 — Dependiente de pipeline | Fase 6 | Laboratorio IA con artefactos publicados (o «En desarrollo»). |
| P0 — Antes de entregar | Fase 7 | Pruebas, rendimiento, documentación y demo con backend. |

### Camino crítico

1. Configuración del proyecto (Fase 0).
2. Sistema visual, pestañas y shell de estado (Fase 1).
3. Cliente API, adaptador con reglas v1.0 y estados de datos (Fase 2).
4. Mapa con capas congeladas + timeline funcional (Fase 3).
5. Selección y detalle; filtros completos.
6. Analítica (Fase 4) y Matriz (Fase 5).
7. Laboratorio IA según artefactos del pipeline (Fase 6).
8. QA, rendimiento y demo (Fase 7).

Fases 5 y 6 pueden avanzar en diseño/estructura en paralelo, pero su contenido cuantitativo depende de las definiciones oficiales (5) y de artefactos publicados del pipeline (6).

---

## 5. Dependencias y solicitudes al equipo backend

El frontend se integra con el backend existente sin anticipar capacidades no implementadas. Solicitudes oficiales ordenadas:

| Necesidad frontend | Capacidad backend requerida | Prioridad |
|---|---|---|
| Ficha de detalle, analítica día/noche y comparación por plataforma | Campo `daynight` (nativo FIRMS) | P1 |
| Mapa por plataforma y ficha | Campo `satellite` (Terra/Aqua/Suomi-NPP/NOAA-20/21) | P1 |
| Fichas de zona, filtros geográficos funcionales | Campos `department`, `municipality` (geocodificación backend) | P1 |
| Tarjeta de temperatura de brillo | Campo `brightness_k` | P2 |
| Datasets mayores sin truncarse | Paginación/cursor con metadatos | P2 |
| Concordancia inter-sensor real | Regla científica aprobada + artefacto de matching (puede derivar del pipeline) | P3 |
| Laboratorio IA veraz | Contrato de publicación de artefactos del AI-Pipeline (versión, fecha, métricas) | P3 |

**Regla de integración:** ningún agente frontend debe implementar llamadas a endpoints futuros basándose solo en este roadmap. La incorporación de un servicio nuevo (p. ej. del AI-Pipeline) no crea contratos por sí misma: solo vale lo vigente en el OpenAPI.

Relleno de campos: mientras un campo no exista en la respuesta, la UI lo declara «No disponible»/«Pendiente de datos del backend»; está prohibido rellenarlo con valores por defecto (ni satellite por 'Terra', ni frp por 10.0, ni department por 'Antioquia').

---

## 6. Reglas científicas y de producto no negociables

1. **Fuente única de datos:** el Backend-API. Sin modo demostración, sin dataset sintético de producto; fixtures solo en pruebas, etiquetados.
2. **Detección no equivale a incendio:** una observación es una detección de anomalía térmica, no un incendio independiente.
3. **MODIS y VIIRS son instrumentos distintos:** resoluciones, horarios y algoritmos de detección difieren; nunca se suman sus conteos.
4. **Definiciones oficiales v1.0 obligatorias:** recurrencia 0–100, matriz P=A×C y armonización de confianza se calculan exactamente según `PROJECT_CONTEXT.md` §3; cambiarlas requiere decisión científica documentada.
5. **Confianza original intacta:** `confidence_raw` se conserva y se muestra junto al nivel armonizado.
6. **FRP nula no es un número:** «No disponible»; prohibido el fallback numérico.
7. **Unidades explícitas** y no mezcla de magnitudes (FRP en MW; brillo en K).
8. **UTC preservado:** `acquired_at` es adquisición UTC; `acq_date`/`acq_time` se derivan sin alterar el instante.
9. **Procedencia visible:** `data_provenance`/`source` se muestran tal cual; si el backend reporta datos de demostración, la UI lo etiqueta.
10. **Truncamiento explícito:** `count < total_matching` se comunica siempre.
11. **GeoJSON correcto:** coordenadas `[longitude, latitude]` con validación de rangos.
12. **Sin datos fabricados:** sin rellenos por defecto para campos ausentes (`satellite`, `daynight`, `brightness_k`, `department`, `municipality`, `observation_id`); los controles dependientes se declaran «No disponible» en lugar de simular.
13. **Controles que muestran, funcionan:** la línea de tiempo, los filtros y los toggles afectan realmente la vista o se declaran no disponibles.
14. **Timeline honesta:** la ausencia de detecciones en un paso no equivale a ausencia de incendios (badge permanente).
15. **Laboratorio IA sin ejecución:** nada se entrena ni infiere en el navegador; las fichas muestran artefactos publicados con procedencia y, fuera de ello, el estado «En desarrollo».

---

## 7. Definición de terminado (Definition of Done)

Una HU se considera terminada únicamente cuando:

- Cumple todos sus criterios de aceptación y reproduce visualmente la sección correspondiente de la interfaz congelada.
- Está integrada en la rama de trabajo acordada.
- Pasa lint, typecheck, pruebas relevantes y build.
- No introduce errores de consola en el flujo asociado.
- Tiene estados de carga, vacío y error cuando corresponda; los campos ausentes se muestran «No disponible»/«Pendiente de datos del backend».
- Respeta las reglas científicas v1.0 y el contrato backend vigente.
- Es usable con teclado y mantiene contraste legible.
- La documentación afectada está actualizada.
- El agente entrega resumen con archivos creados/modificados, funcionalidad, comandos ejecutados y resultados, limitaciones y pendientes.

No se debe declarar una prueba como exitosa si no fue ejecutada.

---

## 8. Entregas incrementales sugeridas

### Incremento A — Conexión real y mapa esencial
- Fases 0 y 1.
- Cliente API, health, observaciones, adaptador con reglas v1.0.
- Mapa con observaciones MODIS/VIIRS, leyenda y ficha de detalle.
- Estados de conexión, procedencia y truncamiento.

### Incremento B — Explorador completo
- Timeline funcional sobre el mapa.
- Filtros completos (Modo Fácil / Pro) con gestión de campos no disponibles.
- Heatmap FRP y vistas rápidas operativas. Mejoras de selección y leyenda.

### Incremento C — Analítica y matriz
- KPIs con fórmulas v1.0; evolución mensual; día/noche condicionado al campo.
- Matriz 5×5 congelada con zonas documentadas y advertencias.

### Incremento D — Laboratorio y documentos
- Fichas del AI-Pipeline cuando existan artefactos (o estado «En desarrollo»).
- Export CSV con meta de truncamiento.
- Optimización, pruebas finales, documentación y demo con backend.

---

## 9. Instrucciones para los agentes antes de comenzar cualquier HU

1. Leer `PROJECT_CONTEXT.md`, `AGENTS.md` y este roadmap.
2. Abrir el directorio congelado `../prometheus-ignis` para la sección de interfaz que toque (componente, textos y estados son canónicos).
3. Inspeccionar el estado actual del repositorio y la rama de trabajo.
4. Confirmar que las dependencias y contratos necesarios existen (OpenAPI vigente).
5. Implementar únicamente el alcance de la HU asignada.
6. Añadir o actualizar pruebas.
7. Ejecutar las verificaciones disponibles y reportar resultados reales.

**No avanzar implementando endpoints inexistentes ni rellenando campos con valores por defecto.** Los mocks solo se permiten en pruebas automatizadas, etiquetados y aislados del flujo de producción.
