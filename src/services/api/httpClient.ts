/**
 * Cliente HTTP centralizado del Backend-API.
 *
 * Reglas de integración del repo:
 * - La URL base proviene exclusivamente de VITE_API_BASE_URL (sin valores
 *   codificados y sin panel de configuración de URL en la UI).
 * - Toda la red pasa por aquí: timeout, errores tipados y lectura de
 *   respuestas como JSON genérico. Los servicios de dominio validan sus
 *   contratos encima de este cliente.
 */

const API_VERSION_PREFIX = '/api/v1';
const DEFAULT_TIMEOUT_MS = 10_000;

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'invalid-config';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** Código HTTP cuando la respuesta existió; null para errores de red/timeout. */
  readonly status: number | null;

  constructor(kind: ApiErrorKind, message: string, status: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

function readBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof baseUrl !== 'string' || baseUrl.trim().length === 0) {
    throw new ApiError(
      'invalid-config',
      'VITE_API_BASE_URL no está configurada. Copia .env.example a .env y define la URL del Backend-API.',
    );
  }
  if (!/^https?:\/\//i.test(baseUrl.trim())) {
    throw new ApiError(
      'invalid-config',
      `VITE_API_BASE_URL debe ser una URL http(s) válida (valor recibido: "${baseUrl}"). Consulta .env.example.`,
    );
  }
  return baseUrl.trim().replace(/\/+$/, '');
}

/** Construye la URL absoluta de un endpoint del API, p. ej. `buildApiUrl('/health')`. */
export function buildApiUrl(path: string): string {
  return `${readBaseUrl()}${API_VERSION_PREFIX}${path}`;
}

/**
 * Ejecuta una petición GET y devuelve el estado HTTP con el cuerpo como
 * JSON genérico. No interpreta contratos: cada servicio valida su respuesta.
 */
export async function requestJson(
  path: string,
  options: { timeoutMs?: number } = {},
): Promise<{ status: number; body: unknown }> {
  const url = buildApiUrl(path);
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      throw new ApiError('http', `El backend respondió con el estado HTTP ${response.status}.`, response.status);
    }

    return { status: response.status, body };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError('timeout', `La petición a ${path} superó el tiempo de espera (${timeoutMs} ms).`);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('network', `No fue posible contactar el Backend-API (${path}).`, null);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
