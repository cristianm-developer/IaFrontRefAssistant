import { defineConfig } from 'ia-front-ref-assistant';

export default defineConfig({
  components: [
    {
      kind: 'CtaCard',
      variants: [
        { value: 'primary', label: 'Primario' },
        { value: 'ghost', label: 'Fantasma' },
        { value: 'secondary', label: 'Secundario' },
      ],
      sizes: [
        { value: 'sm', label: 'Chico' },
        { value: 'md', label: 'Mediano' },
        { value: 'lg', label: 'Grande' },
      ],
    },
  ],
  theme: [
    {
      key: 'bg-color',
      label: 'Color de fondo',
      values: [
        { value: '#ffffff', label: 'Blanco' },
        { value: '#f3f4f6', label: 'Gris claro' },
        { value: '#0d0d0d', label: 'Oscuro' },
        { value: '#1a1a1a', label: 'Gris oscuro' },
      ],
    },
    {
      key: 'text-color',
      label: 'Color de texto',
      values: [
        { value: '#000000', label: 'Negro' },
        { value: '#ffffff', label: 'Blanco' },
        { value: '#4b5563', label: 'Gris medio' },
      ],
    },
    {
      key: 'accent-color',
      label: 'Color de acento',
      values: [
        { value: '#3b82f6', label: 'Azul' },
        { value: '#ef4444', label: 'Rojo' },
        { value: '#10b981', label: 'Verde' },
        { value: '#f59e0b', label: 'Naranja' },
      ],
    },
    {
      key: 'border-radius',
      label: 'Border radius',
      // Sin values → permite entrada libre
    },
    {
      key: 'shadow',
      label: 'Sombra',
      values: [
        { value: 'none', label: 'Sin sombra' },
        { value: 'sm', label: 'Pequeña' },
        { value: 'md', label: 'Mediana' },
        { value: 'lg', label: 'Grande' },
      ],
    },
  ],
});
