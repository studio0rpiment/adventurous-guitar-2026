import { SYNTH } from "@/audio/synth/config";
import { midiToHz } from "@/audio/synth/voicings";

/** Only touch an AudioParam when the value actually moved this much. */
const EPS = 1e-3;

/**
 * One cable's voice: a single square wave. Pitch (as MIDI, gliding), a tone
 * level (chord tone vs. passing tone) and a motion level, each on its own gain
 * so they don't fight over one AudioParam.
 */
export class CableVoice {
  private osc: OscillatorNode;
  private toneGain: GainNode;
  private out: GainNode;
  private last = { midi: -1, tone: -1, level: -1 };

  constructor(
    private ctx: AudioContext,
    dest: AudioNode,
    amp: number,
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.toneGain = ctx.createGain();
    this.toneGain.gain.value = 1;
    const trim = ctx.createGain();
    trim.gain.value = amp;

    this.osc = ctx.createOscillator();
    this.osc.type = "square";
    this.osc.frequency.value = 440;
    this.osc.connect(this.toneGain).connect(this.out).connect(trim).connect(dest);
    this.osc.start();
  }

  /** tau: glide time (defaults to SYNTH.tauPitch). */
  setMidi(midi: number, tau: number = SYNTH.tauPitch) {
    if (Math.abs(midi - this.last.midi) < EPS) return;
    const first = this.last.midi < 0;
    this.last.midi = midi;
    const hz = midiToHz(midi);
    if (first) this.osc.frequency.setValueAtTime(hz, this.ctx.currentTime);
    else this.osc.frequency.setTargetAtTime(hz, this.ctx.currentTime, tau);
  }

  setTone(tone: number) {
    if (Math.abs(tone - this.last.tone) < EPS) return;
    this.last.tone = tone;
    this.toneGain.gain.setTargetAtTime(tone, this.ctx.currentTime, SYNTH.tauTone);
  }

  /** level: 0..1. Rise/fall speeds from SYNTH.tauRise / tauFall. */
  setLevel(level: number) {
    if (Math.abs(level - this.last.level) < EPS) return;
    const tau = level > this.last.level ? SYNTH.tauRise : SYNTH.tauFall;
    this.last.level = level;
    this.out.gain.setTargetAtTime(level, this.ctx.currentTime, tau);
  }

  dispose() {
    this.osc.stop();
    this.osc.disconnect();
    this.toneGain.disconnect();
    this.out.disconnect();
  }
}
