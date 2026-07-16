import { useAudio } from "@/audio/useAudio";
import { FESTIVAL } from "@/config/festival";

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
        padding: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        zIndex: 10,
      }}
    >
      <div>
        <strong style={{ letterSpacing: "0.04em" }}>{FESTIVAL.shortName}</strong>
        <span style={{ color: "var(--ags-muted)", marginLeft: "0.5rem" }}>
          {FESTIVAL.year}
        </span>
      </div>

      <button
        type="button"
        onClick={toggleMute}
        disabled={!unlocked}
        style={{
          pointerEvents: "auto",
          background: "transparent",
          color: "var(--ags-fg)",
          border: "1px solid var(--ags-muted)",
          borderRadius: "999px",
          padding: "0.4rem 0.9rem",
          cursor: unlocked ? "pointer" : "not-allowed",
          opacity: unlocked ? 1 : 0.5,
        }}
      >
        {muted ? "Sound off" : "Sound on"}
      </button>
    </div>
  );
}
