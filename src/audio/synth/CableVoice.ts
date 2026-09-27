import { SYNTH } from "@/audio/synth/config";

const SHAPES: OscillatorType[] = ["sawtooth", "square"];
/** Rough loudness match: a square carries more energy than a saw. */
const SHAPE_TRIM = [1, 0.75];
/** Only touch an AudioParam when the value actually moved this much. */
const EPS = 1e-3;

export interface VoiceNote {
  hz: number;
  /** Relative level of this note within the voice. */
  amp: number;
}

/**
 * One cable's voice: one or more notes (e.g. a harmonic and its upper partner),
 * each sounded as a saw AND a square at the same pitch. The two shapes are
 * crossfaded as two buses, so the waveform morphs continuously saw ↔ square
 * (Web Audio can't morph a single oscillator's type). Pitch bend moves every
 * note together, so the voice keeps its internal ratios.
 */
export class CableVoice {
  private oscs: { osc: OscillatorNode; hz: number }[] = [];
  private shapeBus: GainNode[];
  private out: GainNode;
  private last = { ratio: 1, shape: -1, level: -1 };

  constructor(
    private ctx: AudioContext,
    dest: AudioNode,
    notes: VoiceNote[],
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(dest);

    this.shapeBus = SHAPES.map((_, i) => {
      const g = ctx.createGain();
      g.gain.value = i === 0 ? SHAPE_TRIM[0] : 0;
      g.connect(this.out);
      return g;
    });

    for (const n of notes) {
      const noteGain = SHAPES.map((_, i) => {
        const g = ctx.createGain();
        g.gain.value = n.amp;
        g.connect(this.shapeBus[i]);
        return g;
      });
      SHAPES.forEach((type, i) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = n.hz;
        o.connect(noteGain[i]);
        o.start();
        this.oscs.push({ osc: o, hz: n.hz });
      });
    }
  }

  /** ratio: pitch multiplier (1 = in tune). */
  setPitch(ratio: number) {
    if (Math.abs(ratio - this.last.ratio) < EPS * 0.1) return;
    this.last.ratio = ratio;
    const t = this.ctx.currentTime;
    for (const { osc, hz } of this.oscs) osc.frequency.setTargetAtTime(hz * ratio, t, SYNTH.tauPitch);
  }

  /** shape: 0 sawtooth → 1 square (equal-power crossfade). */
  setShape(shape: number) {
    if (Math.abs(shape - this.last.shape) < EPS) return;
    this.last.shape = shape;
    const w = [Math.cos((shape * Math.PI) / 2), Math.sin((shape * Math.PI) / 2)];
    const t = this.ctx.currentTime;
    this.shapeBus.forEach((g, i) => g.gain.setTargetAtTime(w[i] * SHAPE_TRIM[i], t, SYNTH.tauShape));
  }

  /** level: 0..1. Rise/fall speeds from SYNTH.tauRise / tauFall. */
  setLevel(level: number) {
    if (Math.abs(level - this.last.level) < EPS) return;
    const tau = level > this.last.level ? SYNTH.tauRise : SYNTH.tauFall;
    this.last.level = level;
    this.out.gain.setTargetAtTime(level, this.ctx.currentTime, tau);
  }

  dispose() {
    this.oscs.forEach(({ osc }) => {
      osc.stop();
      osc.disconnect();
    });
    this.shapeBus.forEach((g) => g.disconnect());
    this.out.disconnect();
  }
}
