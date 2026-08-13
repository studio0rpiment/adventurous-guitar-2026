import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SectionId } from "@/config/sections";

interface NavState {
  section: SectionId | null;
  open: (id: string) => void;
  close: () => void;
}

const NavContext = createContext<NavState | null>(null);

/**
 * Tiny navigation state for the pick-menu sections. State-driven (not a URL
 * router) so the 3D canvas stays mounted underneath and we don't take on
 * react-router while the site is still prototyping. Swap this for a real router
 * later without touching the panels — they only read `section` / `close`.
 *
 * Event-driven: opens on a menu click, closes on Escape. No timers.
 */
export function NavProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<SectionId | null>(null);

  const open = useCallback((id: string) => setSection(id as SectionId), []);
  const close = useCallback(() => setSection(null), []);

  // Close the active section on Escape (event-driven).
  useEffect(() => {
    if (!section) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSection(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section]);

  const value = useMemo(
    () => ({ section, open, close }),
    [section, open, close],
  );
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavState {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within <NavProvider>");
  return ctx;
}
