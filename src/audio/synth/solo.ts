import { cableSynth } from "@/audio/synth/engine";

/**
 * Solo mode: one voice walking the E minor pentatonic (E G A B D), E2–E5.
 * A thumb held in the middle of the screen enters it; each flick moves one
 * step (toward you = down, away = up). The cables still play it: its loudness
 * is the liveliest cable's motion, so a flick that moves the note also swings
 * the cables and sounds it.
 */
const PENTATONIC = [0, 3, 5, 7, 10]; // E G A B D, relative to E
const LOW_E = 40; // E2

export const SOLO_SCALE: number[] = [];
for (let oct = 0; oct < 3; oct++) for (const s of PENTATONIC) SOLO_SCALE.push(LOW_E + oct * 12 + s);
SOLO_SCALE.push(LOW_E + 36); // top E5

/** Where a solo starts: E3. */
const START = SOLO_SCALE.indexOf(52);

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const noteName = (m: number) => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;

export interface SoloState {
  active: boolean;
  index: number;
}

let state: SoloState = { active: false, index: START };
const listeners = new Set<(s: SoloState) => void>();
const emit = () => listeners.forEach((f) => f(state));

export const solo = {
  get state() {
    return state;
  },
  enter() {
    if (state.active || !cableSynth.isOn) return;
    state = { active: true, index: state.index };
    cableSynth.setSolo(true, SOLO_SCALE[state.index]);
    emit();
  },
  exit() {
    if (!state.active) return;
    state = { ...state, active: false };
    cableSynth.setSolo(false);
    emit();
  },
  /** +1 = down the scale (flick toward you), −1 = up (flick away). */
  step(dir: 1 | -1) {
    if (!state.active) return;
    const index = Math.max(0, Math.min(SOLO_SCALE.length - 1, state.index - dir));
    if (index === state.index) return;
    state = { ...state, index };
    cableSynth.setSoloMidi(SOLO_SCALE[index]);
    emit();
  },
  subscribe(f: (s: SoloState) => void) {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
};
