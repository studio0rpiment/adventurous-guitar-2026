import { useEffect, useState } from "react";
import { solo, type SoloState } from "@/audio/synth/solo";

/** React view of solo mode. */
export function useSolo(): SoloState {
  const [s, setS] = useState(solo.state);
  useEffect(() => solo.subscribe(setS), []);
  return s;
}
