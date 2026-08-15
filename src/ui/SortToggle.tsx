/**
 * Small segmented control for switching a list's sort order.
 *
 * Generic over the option value so it can be reused by any panel that needs a
 * two-or-three-way switch — pass options + the active value, get a change back.
 * Event-driven: fires only on click, holds no state of its own.
 */
export interface SortOption<T extends string> {
  value: T;
  label: string;
}

export function SortToggle<T extends string>({
  options,
  value,
  onChange,
  label = "Sort",
}: {
  options: SortOption<T>[];
  value: T;
  onChange: (next: T) => void;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
    >
      <span
        style={{
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ags-muted)",
          marginRight: "0.1rem",
        }}
      >
        {label}
      </span>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            style={{
              appearance: "none",
              cursor: "pointer",
              padding: "0.28rem 0.6rem",
              borderRadius: "2px",
              fontSize: "0.72rem",
              letterSpacing: "0.04em",
              color: active ? "var(--ags-bg)" : "var(--ags-fg)",
              background: active ? "var(--ags-accent)" : "transparent",
              border: `1px solid ${active ? "var(--ags-accent)" : "rgba(244, 241, 234, 0.28)"}`,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
