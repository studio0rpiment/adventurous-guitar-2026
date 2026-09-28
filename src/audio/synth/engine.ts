import { CableVoice } from "@/audio/synth/CableVoice";
import { SYNTH } from "@/audio/synth/config";
import { CHORDS, UPPER_HARMONICS } from "@/audio/synth/voicings";

/**
 * The cable synth's shared state: one AudioContext, one output chain, one voice
 * per cable. Module-level (like physics/gravity.ts) because the cables drive it
 * from their render tick — no React state in that path. The toggle UI
 * subscribes to on/off changes.
 *
 * Output: cable voices → chord bus ┐
 *         solo voice ─────────────┴→ master gain → gentle lowpass → compressor → speakers.
 * In solo mode the chord bus fades out and the solo voice takes over.
 */
let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let chordBus: GainNode | null = null;
let voices: CableVoice[] = [];
let soloVoice: CableVoice | null = null;
let soloOn = false;
/** Each cable's latest loudness; the solo voice plays at the liveliest one. */
const cableLevels: number[] = [];
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
  chordBus = c.createGain();
  chordBus.connect(master);
  // five chord tones + three upper harmonics, one voice per cable
  const chordTones = CHORDS.hendrix.length;
  const count = chordTones + UPPER_HARMONICS.length;
  voices = Array.from(
    { length: count },
    (_, i) => new CableVoice(c, chordBus!, i < chordTones ? 1 : SYNTH.harmonicLevel),
  );
  soloVoice = new CableVoice(c, master, SYNTH.soloLevel);
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

  /** Enter/leave solo mode: crossfade the chord bus out and the solo voice in. */
  setSolo(active: boolean, midi?: number) {
    if (!ctx || !chordBus || !soloVoice) return;
    soloOn = active;
    const t = ctx.currentTime;
    chordBus.gain.setTargetAtTime(active ? 0 : 1, t, 0.06);
    if (active && midi != null) soloVoice.setMidi(midi, 0.001);
    if (!active) soloVoice.setLevel(0);
  },

  setSoloMidi(midi: number) {
    soloVoice?.setMidi(midi, SYNTH.soloGlide);
  },

  /**
   * Each cable reports its loudness every frame. In solo mode the solo voice
   * sounds at the liveliest cable's level (reported once per frame, on cable 0).
   */
  reportLevel(i: number, level: number) {
    cableLevels[i] = level;
    if (!soloOn || !soloVoice || i !== 0) return;
    let m = 0;
    for (const l of cableLevels) if (l > m) m = l;
    soloVoice.setLevel(m);
  },

  subscribe(f: (on: boolean) => void) {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
};
