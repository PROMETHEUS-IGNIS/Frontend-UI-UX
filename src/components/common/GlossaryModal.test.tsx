import userEvent from '@testing-library/user-event';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import GlossaryModal from './GlossaryModal';

afterEach(() => cleanup());

describe('GlossaryModal (contenido canónico de la plantilla)', () => {
  it('se oculta por completo cuando está cerrado', () => {
    const { container } = render(<GlossaryModal isOpen={false} onClose={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra los 7 términos y sus fuentes cuando está abierto', () => {
    render(<GlossaryModal isOpen onClose={() => undefined} />);

    const dialog = screen.getByRole('dialog', {
      name: 'Glosario Científico & Marco Epistémico',
    });
    expect(dialog).toBeInTheDocument();
    ['Foco de Calor', 'MODIS vs VIIRS', 'FRP', 'Confianza de Detección FIRMS', 'Recurrencia Histórica (0–100)', 'Amenaza vs Exposición vs Vulnerabilidad', 'Matriz de Riesgo Territorial 5×5'].forEach(
      (fragment) => {
        expect(screen.getByText((content) => content.includes(fragment))).toHaveTextContent(fragment);
      },
    );
    expect(screen.getByText(/Fuentes: Giglio/)).toBeInTheDocument();
  });

  it('cierra al pulsar «Entendido»', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<GlossaryModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra al pulsar Escape', () => {
    const onClose = vi.fn();
    render(<GlossaryModal isOpen onClose={onClose} />);

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
