export type TargetType = 'section' | 'component' | 'element';

export interface AssistantConfig {
  active: boolean;
  capture: {
    sections: boolean;
    components: boolean;
    elements: boolean;
  };
  show: {
    sections: boolean;
    components: boolean;
  };
}

export interface PromptEntry {
  id: string;          // uuid o `${Date.now()}-${random}`
  targetId: string;    // valor de data-wrapper-id / data-component-id / id runtime
  targetType: TargetType;
  url: string;
  text: string;         // texto final ya formateado, ver fase 6
  createdAt: number;
}

export const DEFAULT_CONFIG: AssistantConfig = {
  active: true,
  capture: { sections: false, components: false, elements: false },
  show: { sections: false, components: false },
};
