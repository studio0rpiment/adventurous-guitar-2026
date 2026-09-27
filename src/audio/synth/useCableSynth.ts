import { useEffect, useState } from "react";
import { cableSynth } from "@/audio/synth/engine";

/** React view of the cable synth: whether it's on, and start/stop. */
export function useCableSynth() {
  const [on, setOn] = useState(cableSynth.isOn);
  useEffect(() => cableSynth.subscribe(setOn), []);
  return { on, start: cableSynth.start, stop: cableSynth.stop };
}
