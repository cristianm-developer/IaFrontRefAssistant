import { waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountIaFrontRefAssistant } from './mount'

const STYLE_SELECTOR = 'style[data-ia-fra-style]'
const MOUNT_SELECTOR = '[data-ia-fra-mount]'

afterEach(() => {
  // El widget se porta a document.body vía createPortal, fuera del
  // container que le dimos a createRoot — hay que limpiarlo aparte del
  // container/estilo si el test no llamó handle.unmount().
  document.querySelectorAll('.ia-fra-root').forEach((el) => el.remove())
  document.querySelectorAll(MOUNT_SELECTOR).forEach((el) => el.remove())
  document.querySelectorAll(STYLE_SELECTOR).forEach((el) => el.remove())
  vi.restoreAllMocks()
})

describe('mountIaFrontRefAssistant', () => {
  it('inyecta el widget en document.body sin necesitar un container propio', async () => {
    mountIaFrontRefAssistant()

    await waitFor(() => {
      expect(document.body.querySelector('.ia-fra-root')).toBeInTheDocument()
    })
  })

  it('inyecta su propio <style> con el CSS del widget', async () => {
    mountIaFrontRefAssistant()

    // El <style> se inyecta de forma síncrona (antes de createRoot().render()),
    // pero igual esperamos el commit de React para no dejar un render
    // pendiente que se resuelva durante el siguiente test.
    await waitFor(() => {
      expect(document.body.querySelector('.ia-fra-root')).toBeInTheDocument()
    })

    const style = document.querySelector(STYLE_SELECTOR)
    expect(style).toBeInTheDocument()
    expect(style?.textContent).toContain('.ia-fra-button')
  })

  it('es idempotente: una segunda llamada no duplica el botón ni el estilo', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mountIaFrontRefAssistant()
    await waitFor(() => {
      expect(document.querySelectorAll('.ia-fra-button').length).toBe(1)
    })

    mountIaFrontRefAssistant()
    expect(document.querySelectorAll('.ia-fra-button').length).toBe(1)
    expect(document.querySelectorAll(STYLE_SELECTOR).length).toBe(1)
    expect(warnSpy).toHaveBeenCalled()
  })

  it('unmount() limpia el container que creó y no rompe si se llama de nuevo', async () => {
    const handle = mountIaFrontRefAssistant()
    await waitFor(() => {
      expect(document.body.querySelector('.ia-fra-root')).toBeInTheDocument()
    })

    handle.unmount()

    expect(document.querySelector(MOUNT_SELECTOR)).not.toBeInTheDocument()
    expect(() => handle.unmount()).not.toThrow()
  })

  it('acepta un container propio y no lo remueve al hacer unmount', async () => {
    // El widget siempre se porta a document.body (createPortal), así que el
    // container pasado solo aloja la raíz de React — no es donde aparece
    // visualmente el botón.
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handle = mountIaFrontRefAssistant(undefined, { container })
    await waitFor(() => {
      expect(document.body.querySelector('.ia-fra-root')).toBeInTheDocument()
    })

    handle.unmount()
    expect(document.body.contains(container)).toBe(true)

    container.remove()
  })
})
