import { useEffect, useRef, type ReactNode } from "react";

/**
 * Shared overlay shell for pick-menu sections. Presentational only: a dimmed
 * backdrop + a technical-manual card with a titled header and a close control.
 * Sits BELOW the HUD z-index so the pick menu stays usable (switch sections)
 * while a panel is open. Closing is event-driven: backdrop pointer-down, the
 * close button, or Escape (handled in NavProvider).
 *
 * Scrim and card geometry live in global.css (.ags-panel-scrim / .ags-panel),
 * not here: on a phone the card has to start below the stacked HUD, and that
 * clearance belongs in the same media query as the HUD's own padding rather
 * than in a JS breakpoint that could drift out of step with it.
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
    <div className="ags-panel-scrim" onPointerDown={onClose}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onPointerDown={(e) => e.stopPropagation()}
        className="ags-panel"
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
