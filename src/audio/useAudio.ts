import { useContext } from "react";
import { AudioContext } from "@/audio/AudioProvider";

/** Access the audio controls. Must be used within an <AudioProvider>. */
export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudio must be used within an <AudioProvider>");
  }
  return ctx;
}
