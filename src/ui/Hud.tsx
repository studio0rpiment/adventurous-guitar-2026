import { useNav } from "@/ui/nav";
import { PickMenu } from "@/ui/PickMenu";

/**
 * DOM overlay above the canvas: the pick-menu nav. Menu selections open section
 * overlays via nav state. (Sound toggle removed — no audio yet.)
 */
export function Hud() {
  const { open } = useNav();

  return (
    <div
      className="ags-hud"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        paddingTop:
          "calc(max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-top)) + 5px)",
        paddingRight:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-right))",
        paddingBottom:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-bottom))",
        paddingLeft:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-left))",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        zIndex: 10,
      }}
    >
      <PickMenu onSelect={open} />
    </div>
  );
}
