import { useAudio } from "@/audio/useAudio";
import { FESTIVAL } from "@/config/festival";

/**
 * Full-screen intro shown until the user interacts. The interaction that
 * dismisses it is the same gesture that unlocks audio (handled in
 * AudioProvider), so this reacts to `unlocked` state rather than a timer.
 */
export function EnterGate() {
  const { unlocked } = useAudio();
  if (unlocked) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        background: "rgba(10, 10, 15, 0.85)",
        cursor: "pointer",
        zIndex: 20,
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 6vw, 4rem)" }}>
          {FESTIVAL.name}
        </h1>
        <p style={{ color: "var(--ags-muted)", marginTop: "0.5rem" }}>
          {FESTIVAL.tagline}
        </p>
        <p style={{ color: "var(--ags-accent)", marginTop: "2rem" }}>
          Click anywhere to enter (enables sound)
        </p>
      </div>
    </div>
  );
}
