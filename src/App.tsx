import { AudioProvider } from "@/audio/AudioProvider";
import { CanvasStage } from "@/three/CanvasStage";
import { Hud } from "@/ui/Hud";
import { Title } from "@/ui/Title";
import { NavProvider } from "@/ui/nav";
import { SectionOverlay } from "@/ui/SectionOverlay";
import { TITLE_MODE } from "@/config/ui";
import { InfoSections } from "@/ui/InfoSections";
import { Footer } from "@/ui/Footer";

/**
 * App shell. The 3D cable canvas is the base layer; the festival title, the
 * pick-menu section overlays, and the HUD float above it. NavProvider holds
 * which section is open; AudioProvider shares one audio context.
 * (The old landing gate is stashed in _stash/landing/.)
 */
export default function App() {
  return (
    <AudioProvider>
      <NavProvider>
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <CanvasStage />
        </div>
        <InfoSections />
        {TITLE_MODE === "dom" && <Title />}
        <SectionOverlay />
        <Hud />
        <Footer />
      </NavProvider>
    </AudioProvider>
  );
}
