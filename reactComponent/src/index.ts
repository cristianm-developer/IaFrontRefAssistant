// Estilos del componente (se emiten como dist/style.css)
import './styles/index.css';

// Componente raíz público
export { IaFrontRefAssistant } from './IaFrontRefAssistant';
export type { IaFrontRefAssistantProps } from './IaFrontRefAssistant';

// Tipos públicos (fase 1 y sucesivas)
export type { AssistantConfig, PromptEntry, TargetType } from './lib/types';

// Tipos de config (fase 8)
export type { IaFraConfig, ComponentDefinition, ThemeTokenDefinition, ConfigOption } from './config/types';

// Helper de config (fase 8)
export { defineConfig } from './config/defineConfig';
