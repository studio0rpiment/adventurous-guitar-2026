import { CableVoice } from "@/audio/synth/CableVoice";
import { SYNTH } from "@/audio/synth/config";
import { VOICES, voiceHz } from "@/audio/synth/tuning";

/**
 * The cable synth's shared state: one AudioContext, one output chain, one voice
 * per cable. Module-level (like physics/gravity.ts) because the cables drive it
 * from their render tick — no React state in that path. The toggle UI
 * subscribes to on/off changes.
 *
 * Output: voices → master gain → gentle lowpass → compressor → speakers.
 */
let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let voices: CableVoice[] = [];
let on = false;
const listeners = new Set<(on: boolean) => void>();

const emit = () => listeners.forEach((f) => f(on));

function build(c: AudioContext) {
  const master = c.createGain();
  master.gain.value = SYNTH.master;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = SYNTH.lowpassHz;
  const comp = c.createDynamicsCompressor();
  master.connect(lp).connect(comp).connect(c.destination);
  bus = master;
  // higher harmonics sit a little lower so the chord doesn't go shrill
  voices = VOICES.map((v, i) => new CableVoice(c, master, voiceHz(i), 1 / Math.sqrt(v.harmonic)));
}

// Pause the audio thread when the tab is hidden (event-driven).
function onVisibility() {
  if (!ctx) return;
  if (document.hidden) void ctx.suspend();
  else if (on) void ctx.resume();
}

export const cableSynth = {
  get isOn() {
    return on;
  },

  /** Must run inside a user gesture (tap/click): browsers only start audio then. */
  start() {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      build(ctx);
      document.addEventListener("visibilitychange", onVisibility);
    }
    void ctx.resume();
    bus?.gain.cancelScheduledValues(ctx.currentTime);
    bus?.gain.setTargetAtTime(SYNTH.master, ctx.currentTime, 0.05);
    on = true;
    emit();
  },

  stop() {
    if (!ctx) return;
    // ease out, then suspend the audio thread
    const t = ctx.currentTime;
    bus?.gain.setTargetAtTime(0, t, 0.05);
    const c = ctx;
    window.setTimeout(() => {
      // Timer (not an event): the gain fade has no "finished" event to hang on.
      if (!on) void c.suspend();
      bus?.gain.setValueAtTime(SYNTH.master, c.currentTime);
    }, 250);
    on = false;
    emit();
  },

  /** The voice for cable i, or null when sound is off. */
  voice(i: number): CableVoice | null {
    return on ? voices[i % voices.length] ?? null : null;
  },

  subscribe(f: (on: boolean) => void) {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
};
