import { useAudio } from "@/audio/useAudio";
import { PickMenu } from "@/ui/PickMenu";

/**
 * DOM overlay that floats above the canvas. Holds persistent chrome
 * (title, controls). Build nav/sections onto this shell later.
 */
export function Hud() {
  const { muted, toggleMute, unlocked } = useAudio();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        // Respect notches/rounded corners; shrink a touch on small screens.
        paddingTop: "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-top))",
        paddingRight:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-right))",
        paddingBottom:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-bottom))",
        paddingLeft:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-left))",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "0.75rem",
        zIndex: 10,
      }}
    >
      <PickMenu />

      <button
        type="button"
        onClick={toggleMute}
        disabled={!unlocked}
        style={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          minHeight: "2.75rem", // ~44px touch target
          background: "transparent",
          color: "var(--ags-fg)",
          border: "1px solid var(--ags-muted)",
          borderRadius: "999px",
          padding: "0.5rem 1rem",
          fontSize: "clamp(0.8rem, 3.5vw, 0.95rem)",
          whiteSpace: "nowrap",
          cursor: unlocked ? "pointer" : "not-allowed",
          opacity: unlocked ? 1 : 0.5,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {muted ? "Sound off" : "Sound on"}
      </button>
    </div>
  );
}
