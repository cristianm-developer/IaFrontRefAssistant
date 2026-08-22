import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VariantSizePicker } from './VariantSizePicker';
import type { ComponentDefinition } from '../../config/types';

describe('VariantSizePicker', () => {
  it('renderiza variantes y tamaños cuando ambos están presentes', () => {
    const definition: ComponentDefinition = {
      kind: 'Button',
      variants: [
        { value: 'primary', label: 'Primario' },
        { value: 'secondary', label: 'Secundario' },
      ],
      sizes: [{ value: 'md', label: 'Mediano' }],
    };

    const onPick = vi.fn();
    render(<VariantSizePicker definition={definition} onPick={onPick} />);

    // Label "Variante"
    expect(screen.getByText('Variante')).toBeInTheDocument();

    // Label "Tamaño"
    expect(screen.getByText('Tamaño')).toBeInTheDocument();

    // Botones de variantes (2 + 1 "nueva")
    expect(screen.getByRole('button', { name: 'Primario' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secundario' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Nueva variante' })).toBeInTheDocument();

    // Botones de tamaños (1 + 1 "nuevo")
    expect(screen.getByRole('button', { name: 'Mediano' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Nuevo tamaño' })).toBeInTheDocument();
  });

  it('llama onPick con la oración correcta al hacer click en una variante', () => {
    const definition: ComponentDefinition = {
      kind: 'Button',
      variants: [{ value: 'primary', label: 'Primario' }],
    };

    const onPick = vi.fn();

    render(<VariantSizePicker definition={definition} onPick={onPick} />);

    const button = screen.getByRole('button', { name: 'Primario' });
    fireEvent.click(button);

    expect(onPick).toHaveBeenCalledWith('Usa la variante "Primario".');
  });

  it('llama onPick con la oración correcta al hacer click en un tamaño', () => {
    const definition: ComponentDefinition = {
      kind: 'Button',
      sizes: [{ value: 'lg', label: 'Grande' }],
    };

    const onPick = vi.fn();

    render(<VariantSizePicker definition={definition} onPick={onPick} />);

    const button = screen.getByRole('button', { name: 'Grande' });
    fireEvent.click(button);

    expect(onPick).toHaveBeenCalledWith('Usa el tamaño "Grande".');
  });

  it('llama onPick con oración abierta al hacer click en "+ Nueva variante"', () => {
    const definition: ComponentDefinition = {
      kind: 'Button',
      variants: [{ value: 'primary', label: 'Primario' }],
    };

    const onPick = vi.fn();

    render(<VariantSizePicker definition={definition} onPick={onPick} />);

    const button = screen.getByRole('button', { name: '+ Nueva variante' });
    fireEvent.click(button);

    expect(onPick).toHaveBeenCalledWith('Agregá una nueva variante para este componente: ');
  });

  it('llama onPick con oración abierta al hacer click en "+ Nuevo tamaño"', () => {
    const definition: ComponentDefinition = {
      kind: 'Button',
      sizes: [{ value: 'md', label: 'Mediano' }],
    };

    const onPick = vi.fn();

    render(<VariantSizePicker definition={definition} onPick={onPick} />);

    const button = screen.getByRole('button', { name: '+ Nuevo tamaño' });
    fireEvent.click(button);

    expect(onPick).toHaveBeenCalledWith('Agregá un nuevo tamaño para este componente: ');
  });

  it('renderiza solo tamaños cuando variants está vacío', () => {
    const definition: ComponentDefinition = {
      kind: 'Button',
      variants: [],
      sizes: [{ value: 'md', label: 'Mediano' }],
    };

    render(<VariantSizePicker definition={definition} onPick={() => {}} />);

    expect(screen.queryByText('Variante')).not.toBeInTheDocument();
    expect(screen.getByText('Tamaño')).toBeInTheDocument();
  });

  it('renderiza solo variantes cuando sizes está vacío', () => {
    const definition: ComponentDefinition = {
      kind: 'Button',
      variants: [{ value: 'primary', label: 'Primario' }],
      sizes: [],
    };

    render(<VariantSizePicker definition={definition} onPick={() => {}} />);

    expect(screen.getByText('Variante')).toBeInTheDocument();
    expect(screen.queryByText('Tamaño')).not.toBeInTheDocument();
  });

  it('devuelve null cuando no hay variantes ni tamaños', () => {
    const definition: ComponentDefinition = {
      kind: 'Button',
    };

    const { container } = render(<VariantSizePicker definition={definition} onPick={() => {}} />);

    expect(container.firstChild).toBeNull();
  });
});
