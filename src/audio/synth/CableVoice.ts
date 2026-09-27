import { SYNTH } from "@/audio/synth/config";

const SHAPES: OscillatorType[] = ["triangle", "sawtooth", "square"];
/** Rough loudness match: saws and squares carry more energy than a triangle. */
const SHAPE_TRIM = [1, 0.7, 0.55];
/** Only touch an AudioParam when the value actually moved this much. */
const EPS = 1e-3;

/**
 * One cable's voice: a triangle, a saw and a square at the same pitch, cross-
 * faded so the waveform can morph continuously (Web Audio can't morph a single
 * oscillator's type). Pitch, shape and level are set from the cable's sway.
 */
export class CableVoice {
  private oscs: OscillatorNode[];
  private mix: GainNode[];
  private out: GainNode;
  private last = { ratio: 1, shape: -1, level: -1 };

  constructor(
    private ctx: AudioContext,
    dest: AudioNode,
    private hz: number,
    amp: number,
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    const trim = ctx.createGain();
    trim.gain.value = amp;
    this.out.connect(trim).connect(dest);

    this.oscs = SHAPES.map((type) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = hz;
      return o;
    });
    this.mix = SHAPES.map((_, i) => {
      const g = ctx.createGain();
      g.gain.value = i === 0 ? SHAPE_TRIM[0] : 0;
      return g;
    });
    this.oscs.forEach((o, i) => {
      o.connect(this.mix[i]).connect(this.out);
      o.start();
    });
  }

  /** ratio: pitch multiplier (1 = in tune). */
  setPitch(ratio: number) {
    if (Math.abs(ratio - this.last.ratio) < EPS * 0.1) return;
    this.last.ratio = ratio;
    const t = this.ctx.currentTime;
    for (const o of this.oscs) o.frequency.setTargetAtTime(this.hz * ratio, t, SYNTH.tauPitch);
  }

  /** shape: 0 triangle → 0.5 saw → 1 square. */
  setShape(shape: number) {
    if (Math.abs(shape - this.last.shape) < EPS) return;
    this.last.shape = shape;
    const w = [
      Math.max(0, 1 - 2 * shape),
      1 - Math.abs(2 * shape - 1),
      Math.max(0, 2 * shape - 1),
    ];
    const t = this.ctx.currentTime;
    this.mix.forEach((g, i) => g.gain.setTargetAtTime(w[i] * SHAPE_TRIM[i], t, SYNTH.tauShape));
  }

  /** level: 0..1. Rises slowly (swells), falls quickly (ducks). */
  setLevel(level: number) {
    if (Math.abs(level - this.last.level) < EPS) return;
    const tau = level > this.last.level ? SYNTH.tauRise : SYNTH.tauFall;
    this.last.level = level;
    this.out.gain.setTargetAtTime(level, this.ctx.currentTime, tau);
  }

  dispose() {
    this.oscs.forEach((o) => {
      o.stop();
      o.disconnect();
    });
    this.mix.forEach((g) => g.disconnect());
    this.out.disconnect();
  }
}
