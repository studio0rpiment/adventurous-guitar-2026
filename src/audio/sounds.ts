/**
 * Sound registry. Add clips here (files live in /public/audio) and reference
 * them by key elsewhere. Kept data-only so the provider stays generic.
 *
 * Example once you drop in files:
 *   ambient: { src: ["/audio/ambient-stage.webm"], loop: true, volume: 0.4 },
 *   uiClick: { src: ["/audio/ui-click.webm"], volume: 0.8 },
 */
export interface SoundDef {
  src: string[];
  loop?: boolean;
  volume?: number;
  /** Preload on init. Defaults to true. */
  preload?: boolean;
}

export const SOUNDS: Record<string, SoundDef> = {
  // Intentionally empty for the skeleton — populate as assets arrive.
};

/**
 * Keys of the registry. While SOUNDS is empty this is `string`; once you add
 * entries you can tighten this to `keyof typeof SOUNDS` for literal autocomplete.
 */
export type SoundKey = string;
