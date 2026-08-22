import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { IaFrontRefAssistant } from './IaFrontRefAssistant'

describe('IaFrontRefAssistant', () => {
  it('renderiza children sin afectarlos', async () => {
    render(
      <IaFrontRefAssistant>
        <p>contenido de prueba</p>
      </IaFrontRefAssistant>
    )
    expect(screen.getByText('contenido de prueba')).toBeInTheDocument()
  })

  it('monta el portal en document.body solo después del primer efecto', async () => {
    const { container } = render(
      <IaFrontRefAssistant>
        <p>contenido</p>
      </IaFrontRefAssistant>
    )

    // En el primer render (antes del useEffect), el portal no debe existir
    expect(container.querySelector('.ia-fra-root')).not.toBeInTheDocument()

    // Después del efecto, debe estar en document.body
    await waitFor(() => {
      expect(document.body.querySelector('.ia-fra-root')).toBeInTheDocument()
    })
  })

  it('detecta instancia anidada y solo renderiza children', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <IaFrontRefAssistant>
        <IaFrontRefAssistant>
          <p>contenido anidado</p>
        </IaFrontRefAssistant>
      </IaFrontRefAssistant>
    )

    // Solo un botón debe existir (de la instancia externa)
    await waitFor(() => {
      const buttons = document.querySelectorAll('.ia-fra-button')
      expect(buttons.length).toBe(1)
    })

    // Debe haber un console.warn en desarrollo
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('IaFrontRefAssistant')
    )

    consoleWarnSpy.mockRestore()
  })
})
