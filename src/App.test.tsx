import userEvent from '@testing-library/user-event';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import App from './App';
import { useUiStore } from '@/stores/uiStore';

describe('App shell de pestañas', () => {
  // El shell tiene navegación sin router y estado global (Zustand singleton):
  // cada prueba parte de un DOM limpio y del módulo inicial.
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useUiStore.setState({ activeModule: 'explorer' });
  });
  it('muestra el módulo Mapa Territorial por defecto', () => {
    render(<App />);

    const defaultPanel = screen.getByRole('tabpanel');
    expect(defaultPanel).toHaveAccessibleName('Mapa Territorial');
    const activeTab = screen.getByRole('tab', { name: 'Mapa Territorial' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('cambia de módulo al activar otra pestaña', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Laboratorio IA' }));

    expect(screen.getByRole('tab', { name: 'Laboratorio IA' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Laboratorio IA');
  });

  it('renderea los módulos en desarrollo con su estado provisional', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Matriz 5×5' }));

    expect(screen.getByText('Módulo en desarrollo')).toBeInTheDocument();
  });
});
