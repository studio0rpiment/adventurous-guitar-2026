import { AudioProvider } from "@/audio/AudioProvider";
import { CanvasStage } from "@/three/CanvasStage";
import { Hud } from "@/ui/Hud";
import { EnterGate } from "@/ui/EnterGate";

/**
 * App shell. The 3D canvas is the base layer; DOM UI (HUD, gate) floats above.
 * AudioProvider wraps everything so both the canvas and the UI share one
 * audio context.
 */
export default function App() {
  return (
    <AudioProvider>
      <CanvasStage />
      <Hud />
      <EnterGate />
    </AudioProvider>
  );
}
