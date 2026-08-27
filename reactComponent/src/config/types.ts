export interface ConfigOption {
  value: string; // valor técnico (lo que se inyecta en el prompt entre comillas)
  label: string; // lo que se muestra en el botón/pill del selector
}

export interface ComponentDefinition {
  kind: string; // debe matchear el valor de data-component-kind, comparación exacta
  variants?: ConfigOption[];
  sizes?: ConfigOption[];
}

export interface ThemeTokenDefinition {
  key: string;   // identificador libre, ej. 'border-radius' — no se valida contra CSS real
  label: string; // texto mostrado y usado en la oración inyectada
  values?: ConfigOption[]; // opcional: valores conocidos (ver nota en spec)
}

export interface IaFraConfig {
  components?: ComponentDefinition[];
  theme?: ThemeTokenDefinition[];
  // Texto fijo que se antepone a TODO prompt final generado por el modal
  // (ver formatPrompt en lib/promptFormat.ts). Sirve para que el prompt
  // siempre lleve referencias importantes del proyecto — típicamente qué
  // skills/convenciones debe usar la IA para implementar el cambio, ej.
  // 'Usa la skill frontend-component y la skill frontend-context para
  // entender cómo implementar estos cambios.'. Lo suele generar la skill
  // `config-mapper` al correr /init-ia-front-assistent, pero el usuario puede
  // editarlo/reemplazarlo a mano en cualquier momento.
  prePrompt?: string;
  // Por defecto se incluyen todos los atributos disponibles. Si se define,
  // solo estos atributos entran en la referencia copiada.
  referenceAttributes?: readonly AIUIReferenceAttribute[];
  // Incluye estados booleanos como disabled, checked y expanded. Default true.
  includeSemanticState?: boolean;
}
import type { AIUIReferenceAttribute } from '../lib/constants';
