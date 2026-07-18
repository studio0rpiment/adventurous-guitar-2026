import { useAudio } from "@/audio/useAudio";
import { MEDIA } from "@/config/media";
import { RiceCallout } from "@/ui/RiceCallout";
import { EnterCue } from "@/ui/EnterCue";

/**
 * Landing: the festival logo (JPEG) centered on black, with the Rice callout
 * annotation. The first user gesture unlocks audio (AudioProvider) and this
 * gate hides, revealing the 3D scene. The Rice link stops propagation so it
 * opens without triggering that "enter" gesture.
 */
export function EnterGate() {
  const { unlocked } = useAudio();
  if (unlocked) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: `${1122} / ${1402}`,
          height: "min(85svh, 122vw)",
          maxWidth: "94vw",
          // Container so the callout label and ENTER cue can size in cqw and
          // scale down with the logo on small screens.
          containerType: "inline-size",
        }}
      >
        <img
          src={MEDIA.logo}
          alt="Adventurous Electric Guitar Festival"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
        <RiceCallout />

        {/* Enter cue nested in the pick's bottom tip. The whole gate is
            clickable, so this is a visual affordance (pointer-events: none). */}
        <span
          style={{
            position: "absolute",
            left: `${(572 / 1122) * 100}%`,
            top: `${(1250 / 1402) * 100}%`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <EnterCue />
        </span>
      </div>
    </div>
  );
}
