import { AudioProvider } from "@/audio/AudioProvider";
import { CanvasStage } from "@/three/CanvasStage";
import { Hud } from "@/ui/Hud";
import { EnterGate } from "@/ui/EnterGate";
import { NavProvider } from "@/ui/nav";
import { SectionOverlay } from "@/ui/SectionOverlay";

/**
 * App shell. The 3D canvas is the base layer; the DOM UI (HUD, gate) and the
 * pick-menu section overlays float above it. NavProvider holds which section is
 * open; AudioProvider shares one audio context across canvas + UI.
 */
export default function App() {
  return (
    <AudioProvider>
      <NavProvider>
        <CanvasStage />
        <SectionOverlay />
        <Hud />
        <EnterGate />
      </NavProvider>
    </AudioProvider>
  );
}
