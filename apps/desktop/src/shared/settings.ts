import { z } from 'zod';

export const buttonOrderEnum = z.enum(['home', 'back', 'forward', 'search', 'settings', 'refresh']);

export const settingsSchema = z.object({
  version: z.literal(1).default(1),
  window: z
    .object({
      width: z.number().min(800).max(3840).default(1280),
      height: z.number().min(600).max(2160).nullable().default(null),
      startState: z.enum(['last', 'maximized', 'normal']).default('last'),
      alwaysOnTop: z.boolean().default(false),
      resizable: z.boolean().default(true),
      minWidth: z.number().min(640).max(3840).default(900),
      minHeight: z.number().min(480).max(2160).default(600)
    })
    .default({})
    .optional(),
  ua: z
    .object({
      mode: z.enum(['default', 'chrome-desktop', 'chrome-android', 'custom']).default('default'),
      custom: z.string().max(512).default(''),
      reloadOnChange: z.boolean().default(true)
    })
    .default({})
    .optional(),
  dpi: z
    .object({
      mode: z.enum(['off', 'demergi']).default('demergi'),
      port: z.number().min(1).max(65535).default(8080),
      bypass: z.string().default(''),
      autoStart: z.boolean().default(true)
    })
    .default({})
    .optional(),
  adblock: z
    .object({
      enabled: z.boolean().default(true),
      strength: z.enum(['ads', 'ads-and-tracking', 'full']).default('full'),
      cosmetics: z.boolean().default(true)
    })
    .default({})
    .optional(),
  
  ui: z
    .object({
      language: z.enum(['en', 'ru']).default('en'),
      theme: z.enum(['yt-dark', 'yt-light', 'auto']).default('yt-dark'),
      scale: z.union([z.literal(0.9), z.literal(1), z.literal(1.1), z.literal(1.25)]).default(1),
      backdropOpacity: z.number().min(0).max(0.4).default(0.2),
      animations: z.boolean().default(true),
      hotkeys: z.boolean().default(true),
      autoCloseOnNav: z.boolean().default(true),
      closeOnEsc: z.boolean().default(true),
      closeOnOutside: z.boolean().default(true),
      iconSet: z.enum(['lucide', 'material']).default('lucide')
    })
    .default({})
    .optional(),
  fab: z
    .object({
      position: z.enum(['right-bottom', 'left-bottom']).default('right-bottom'),
      padding: z.number().min(8).max(32).default(24),
      size: z.enum(['s', 'm', 'l']).default('m'),
      shape: z.enum(['circle', 'rounded']).default('circle'),
      opacity: z.number().min(0.6).max(1).default(1),
      hoverOpen: z.boolean().default(false),
      closeOnVideoClick: z.boolean().default(true),
      tooltips: z.boolean().default(true),
      buttonOrder: z.array(buttonOrderEnum).min(5).max(6).default(['home', 'back', 'forward', 'refresh', 'search', 'settings'])
    })
    .default({})
    .optional()
});

export type Settings = z.infer<typeof settingsSchema>;

export const defaultSettings: Settings = settingsSchema.parse({
  window: {},
  ua: {},
  dpi: {},
  adblock: {},
  
  ui: {},
  fab: {}
});

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
