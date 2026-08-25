// Estilos del componente. Se emiten también como dist/style.css por si algún
// consumidor prefiere un <link>/import de CSS explícito (ej. para evitar un
// flash sin estilos), pero mountIaFrontRefAssistant() ya inyecta este mismo
// CSS por su cuenta (ver mount.tsx) — no hace falta importarlo aparte.
import './styles/index.css';

// NOTA: `IaFrontRefAssistant` (el componente JSX que envuelve `children`) es
// intencionalmente interno, no se exporta acá. Este paquete compila
// react/react-dom aliaseados a preact/compat (ver vite.config.ts) — un React
// real del proyecto host reconciliando este componente como hijo de su
// propio árbol rompe (los hooks de Preact no tienen el "componente actual"
// que solo el reconciler de Preact les da). `mountIaFrontRefAssistant()` no
// tiene ese problema porque crea su propia raíz de render aislada — es la
// única forma pública de montar el widget, y funciona igual en cualquier
// framework host, React incluido.

// Tipos públicos (fase 1 y sucesivas)
export type { AssistantConfig, PromptEntry, TargetType } from './lib/types';

// Tipos de config (fase 8)
export type { IaFraConfig, ComponentDefinition, ThemeTokenDefinition, ConfigOption } from './config/types';

// Helper de config (fase 8)
export { defineConfig } from './config/defineConfig';

// Bootstrap framework-agnóstico: monta el widget como isla React propia,
// sin envolver el árbol de la app, e inyecta su propio CSS (ver mount.tsx).
export { mountIaFrontRefAssistant } from './mount';
export type { MountOptions, MountHandle } from './mount';
