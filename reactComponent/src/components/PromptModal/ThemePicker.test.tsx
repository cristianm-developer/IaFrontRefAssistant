import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemePicker } from './ThemePicker';
import type { ThemeTokenDefinition } from '../../config/types';

describe('ThemePicker', () => {
  it('devuelve null cuando el array de tokens está vacío', () => {
    const { container } = render(<ThemePicker tokens={[]} onPick={() => {}} />);

    expect(container.firstChild).toBeNull();
  });

  it('renderiza el selector de propiedad con todos los tokens', () => {
    const tokens: ThemeTokenDefinition[] = [
      { key: 'bg-color', label: 'Color de fondo' },
      { key: 'border-color', label: 'Color de borde' },
      { key: 'border-radius', label: 'Border radius' },
    ];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'bg-color' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'border-color' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'border-radius' })).toBeInTheDocument();
  });

  it('no muestra el selector de valor hasta elegir una propiedad', () => {
    const tokens: ThemeTokenDefinition[] = [{ key: 'bg-color', label: 'Color de fondo' }];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    expect(screen.getAllByRole('combobox')).toHaveLength(1);
  });

  it('token sin values muestra un input de texto libre', () => {
    const tokens: ThemeTokenDefinition[] = [{ key: 'bg-color', label: 'Color de fondo' }];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'bg-color' } });

    expect(screen.getByPlaceholderText('Escribí el valor…')).toBeInTheDocument();
  });

  it('input de texto libre llama onPick al presionar Enter', () => {
    const tokens: ThemeTokenDefinition[] = [{ key: 'bg-color', label: 'Color de fondo' }];
    const onPick = vi.fn();

    render(<ThemePicker tokens={tokens} onPick={onPick} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'bg-color' } });

    const input = screen.getByPlaceholderText('Escribí el valor…');
    fireEvent.change(input, { target: { value: '#fff' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onPick).toHaveBeenCalledWith('Cambiá `bg-color` a `#fff`.');
  });

  it('token con values renderiza un segundo selector con las opciones', () => {
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

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'border-radius' } });

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    expect(screen.getByRole('option', { name: 'Pequeño' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mediano' })).toBeInTheDocument();
  });

  it('elegir un value llama onPick con la oración formateada', () => {
    const tokens: ThemeTokenDefinition[] = [
      {
        key: 'border-radius',
        label: 'Border radius',
        values: [{ value: 'sm', label: 'Pequeño' }],
      },
    ];
    const onPick = vi.fn();

    render(<ThemePicker tokens={tokens} onPick={onPick} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'border-radius' } });

    const [, valueSelect] = screen.getAllByRole('combobox');
    fireEvent.change(valueSelect, { target: { value: 'sm' } });

    expect(onPick).toHaveBeenCalledWith('Cambiá `border-radius` a `Pequeño`.');
  });

  it('maneja tokens con array de values vacío como sin values (input libre)', () => {
    const tokens: ThemeTokenDefinition[] = [
      {
        key: 'border-radius',
        label: 'Border radius',
        values: [],
      },
    ];

    render(<ThemePicker tokens={tokens} onPick={() => {}} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'border-radius' } });

    expect(screen.getByPlaceholderText('Escribí el valor…')).toBeInTheDocument();
  });
});
