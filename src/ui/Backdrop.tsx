import { MEDIA } from "@/config/media";

interface BackdropProps {
  /** Darkening overlay opacity (0–1) to keep foreground text legible. */
  dim?: number;
}

/**
 * Full-screen responsive background image that sits behind overlay content.
 * Uses <picture> so the browser picks the portrait mobile crop on small
 * screens and the wide stage photo on larger ones.
 */
export function Backdrop({ dim = 0.55 }: BackdropProps) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <picture>
        <source
          media="(max-width: 640px)"
          srcSet={MEDIA.stageBackgroundMobile}
        />
        <img
          src={MEDIA.stageBackground}
          alt=""
          aria-hidden
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </picture>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(10, 10, 15, ${dim})`,
        }}
      />
    </div>
  );
}
