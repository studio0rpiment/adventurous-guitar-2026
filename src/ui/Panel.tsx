import { useEffect, useRef, type ReactNode } from "react";

/**
 * Shared overlay shell for pick-menu sections. Presentational only: a dimmed
 * backdrop + a technical-manual card with a titled header and a close control.
 * Sits BELOW the HUD z-index so the pick menu stays usable (switch sections)
 * while a panel is open. Closing is event-driven: backdrop pointer-down, the
 * close button, or Escape (handled in NavProvider).
 */
export function Panel({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Move focus into the panel when it opens (accessibility).
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  return (
    <div
      onPointerDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 8, // below the HUD (10) so the pick menu stays clickable
        background: "rgba(6, 6, 10, 0.72)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        display: "grid",
        placeItems: "center",
        padding: "clamp(1rem, 5vw, 3rem)",
        pointerEvents: "auto",
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onPointerDown={(e) => e.stopPropagation()}
        className="ags-panel"
        style={{
          width: "min(48rem, 100%)",
          maxHeight: "min(80svh, 100%)",
          display: "flex",
          flexDirection: "column",
          background: "rgba(10, 10, 15, 0.96)",
          border: "1px solid var(--ags-muted)",
          borderRadius: "2px",
          outline: "none",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid rgba(244, 241, 234, 0.18)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)",
                fontWeight: 400,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ags-fg)",
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.72rem",
                  letterSpacing: "0.04em",
                  color: "var(--ags-muted)",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              flex: "0 0 auto",
              appearance: "none",
              background: "none",
              border: "1px solid var(--ags-muted)",
              borderRadius: "999px",
              width: "2rem",
              height: "2rem",
              lineHeight: 1,
              color: "var(--ags-fg)",
              cursor: "pointer",
            }}
          >
            {"×"}
          </button>
        </header>

        <div style={{ overflowY: "auto", padding: "1.1rem 1.25rem 1.4rem" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
