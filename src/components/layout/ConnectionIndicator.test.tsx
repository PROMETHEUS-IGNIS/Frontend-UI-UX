import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ConnectionIndicator from './ConnectionIndicator';

/**
 * El indicador se prueba con stubs de red: nunca solicita el backend real.
 * respuestaJson: la URL base se fija por entorno para que el cliente
 * construya {VITE_API_BASE_URL}/api/v1/health en los casos de conexión.
 */
describe('ConnectionIndicator', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://127.0.0.1:8000');
    fetchMock = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function renderIndicator() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <ConnectionIndicator />
      </QueryClientProvider>,
    );
  }

  function stubFetch(implementation: () => Promise<Response>) {
    fetchMock.mockImplementation(implementation);
    vi.stubGlobal('fetch', fetchMock);
  }

  it('muestra Backend Conectado cuando /health responde 200', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 200 })));
    renderIndicator();

    expect(await screen.findByText('Backend Conectado')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe('http://127.0.0.1:8000/api/v1/health');
  });

  it('muestra Backend No disponible cuando /health responde 503', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 503 })));
    renderIndicator();

    expect(await screen.findByText('Backend No disponible')).toBeInTheDocument();
  });

  it('muestra Backend No disponible ante fallo de red', async () => {
    stubFetch(() => Promise.reject(new TypeError('network down')));
    renderIndicator();

    expect(await screen.findByText('Backend No disponible')).toBeInTheDocument();
  });

  it('muestra Backend No disponible cuando no hay URL configurada', async () => {
    vi.unstubAllEnvs();
    stubFetch(() => Promise.resolve(new Response(null, { status: 200 })));
    renderIndicator();

    expect(await screen.findByText('Backend No disponible')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('parte en estado de comprobación mientras la consulta está en curso', () => {
    stubFetch(
      () => new Promise<Response>(() => undefined), // nunca resuelve en esta prueba
    );
    renderIndicator();

    expect(screen.getByText('Conectando…')).toBeInTheDocument();
  });

  it('recomprueba la conexión al pulsar la píldora', async () => {
    let statusCode = 503;
    stubFetch(() => Promise.resolve(new Response(null, { status: statusCode })));
    const user = userEvent.setup();
    renderIndicator();

    const pill = await screen.findByRole('button', { name: /Backend No disponible/ });
    statusCode = 200;
    await user.click(pill);

    expect(await screen.findByText('Backend Conectado')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
