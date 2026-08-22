import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemePicker } from './ThemePicker';
import type { ThemeTokenDefinition } from '../../config/types';

describe('ThemePicker', () => {
  it('renderiza el toggle colapsado por defecto', () => {
    const tokens: ThemeTokenDefinition[] = [{ key: 'bg-color', label: 'Color de fondo' }];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    expect(screen.getByRole('button', { name: /Theme ▾/ })).toBeInTheDocument();
  });

  it('expande el contenido al hacer click en el toggle', () => {
    const tokens: ThemeTokenDefinition[] = [{ key: 'bg-color', label: 'Color de fondo' }];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    const toggle = screen.getByRole('button', { name: /Theme ▾/ });
    fireEvent.click(toggle);

    // Debería mostrar el token
    expect(screen.getByRole('button', { name: 'Color de fondo' })).toBeInTheDocument();
    expect(screen.getByText(/Theme ▴/)).toBeInTheDocument();
  });

  it('token sin values llama onPick con oración abierta', () => {
    const tokens: ThemeTokenDefinition[] = [{ key: 'bg-color', label: 'Color de fondo' }];
    const onPick = vi.fn();

    render(<ThemePicker tokens={tokens} onPick={onPick} />);

    const toggle = screen.getByRole('button', { name: /Theme ▾/ });
    fireEvent.click(toggle);

    const tokenButton = screen.getByRole('button', { name: 'Color de fondo' });
    fireEvent.click(tokenButton);

    expect(onPick).toHaveBeenCalledWith('Cambiá Color de fondo a ');
  });

  it('token con values expande y renderiza sub-pills', () => {
    const tokens: ThemeTokenDefinition[] = [
      {
        key: 'border-radius',
        label: 'Border radius',
        values: [
          { value: 'sm', label: 'Pequeño' },
          { value: 'md', label: 'Mediano' },
        ],
      },
    ];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    // Expandir el theme
    const toggle = screen.getByRole('button', { name: /Theme ▾/ });
    fireEvent.click(toggle);

    // Click en el token para expandir
    const tokenButton = screen.getByRole('button', { name: 'Border radius' });
    fireEvent.click(tokenButton);

    // Debería aparecer los values
    expect(screen.getByRole('button', { name: 'Pequeño' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mediano' })).toBeInTheDocument();
  });

  it('click en un value llama onPick con oración cerrada y comillas', () => {
    const tokens: ThemeTokenDefinition[] = [
      {
        key: 'border-radius',
        label: 'Border radius',
        values: [{ value: 'sm', label: 'Pequeño' }],
      },
    ];
    const onPick = vi.fn();

    render(<ThemePicker tokens={tokens} onPick={onPick} />);

    // Expandir theme
    const toggle = screen.getByRole('button', { name: /Theme ▾/ });
    fireEvent.click(toggle);

    // Expandir token
    const tokenButton = screen.getByRole('button', { name: 'Border radius' });
    fireEvent.click(tokenButton);

    // Click en value
    const valueButton = screen.getByRole('button', { name: 'Pequeño' });
    fireEvent.click(valueButton);

    expect(onPick).toHaveBeenCalledWith('Cambiá Border radius a "Pequeño".');
  });

  it('devuelve null cuando el array de tokens está vacío', () => {
    const { container } = render(<ThemePicker tokens={[]} onPick={() => {}} />);

    expect(container.firstChild).toBeNull();
  });

  it('collapsa el token expandido al hacer click nuevamente', () => {
    const tokens: ThemeTokenDefinition[] = [
      {
        key: 'border-radius',
        label: 'Border radius',
        values: [{ value: 'sm', label: 'Pequeño' }],
      },
    ];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    // Expandir theme
    const toggle = screen.getByRole('button', { name: /Theme ▾/ });
    fireEvent.click(toggle);

    // Expandir token
    const tokenButton = screen.getByRole('button', { name: 'Border radius' });
    fireEvent.click(tokenButton);

    // Verificar que el value está visible
    expect(screen.getByRole('button', { name: 'Pequeño' })).toBeInTheDocument();

    // Hacer click nuevamente para colapsar
    fireEvent.click(tokenButton);

    // El value debería desaparecer
    expect(screen.queryByRole('button', { name: 'Pequeño' })).not.toBeInTheDocument();
  });

  it('maneja tokens con array de values vacío como sin values', () => {
    const tokens: ThemeTokenDefinition[] = [
      {
        key: 'border-radius',
        label: 'Border radius',
        values: [],
      },
    ];
    const onPick = vi.fn();

    render(<ThemePicker tokens={tokens} onPick={onPick} />);

    // Expandir theme
    const toggle = screen.getByRole('button', { name: /Theme ▾/ });
    fireEvent.click(toggle);

    // Click en el token debería llamar onPick con oración abierta
    const tokenButton = screen.getByRole('button', { name: 'Border radius' });
    fireEvent.click(tokenButton);

    expect(onPick).toHaveBeenCalledWith('Cambiá Border radius a ');
  });

  it('renderiza múltiples tokens', () => {
    const tokens: ThemeTokenDefinition[] = [
      { key: 'bg-color', label: 'Color de fondo' },
      { key: 'border-color', label: 'Color de borde' },
      { key: 'border-radius', label: 'Border radius' },
    ];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    const toggle = screen.getByRole('button', { name: /Theme ▾/ });
    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: 'Color de fondo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Color de borde' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Border radius' })).toBeInTheDocument();
  });
});
