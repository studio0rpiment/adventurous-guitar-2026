import type { CSSProperties } from "react";

/**
 * An outbound link in the site's link style, with the ↗ affordance.
 *
 * Every external link on the panels was three lines of identical anchor
 * boilerplate (target, rel, className, arrow); this is that atom. `label` is
 * the word only — the arrow belongs to the component, so it can never drift
 * between call sites.
 */
export function ExtLink({
  href,
  label,
  style,
}: {
  href: string;
  label: string;
  style?: CSSProperties;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="ags-link" style={style}>
      {label} ↗
    </a>
  );
}
