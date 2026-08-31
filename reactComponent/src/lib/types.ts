export type TargetType = 'section' | 'component' | 'wrapper' | 'element';

export interface PromptImageAttachment {
  type: 'image';
  mimeType: 'image/png';
  dataUrl: string;
}

export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface AssistantConfig {
  active: boolean;
  capture: {
    sections: boolean;
    components: boolean;
    wrappers: boolean;
    elements: boolean;
  };
  show: {
    sections: boolean;
    components: boolean;
    wrappers: boolean;
  };
}

export interface PromptEntry {
  id: string;          // uuid o `${Date.now()}-${random}`
  targetId: string;    // valor de data-wrapper-id / data-component-id / id runtime
  targetType: TargetType;
  url: string;
  text: string;         // texto final ya formateado, ver fase 6
  attachments?: PromptImageAttachment[];
  viewport?: ViewportInfo;
  createdAt: number;
  requestCount?: number; // cantidad de solicitudes individuales agrupadas aquí
}

export const DEFAULT_CONFIG: AssistantConfig = {
  active: true,
  capture: { sections: false, components: false, wrappers: false, elements: false },
  show: { sections: false, components: false, wrappers: false },
};
