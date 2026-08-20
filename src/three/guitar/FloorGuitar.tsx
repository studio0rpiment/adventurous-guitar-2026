import { Suspense, useEffect, useState } from "react";
import { Jaguar } from "./Jaguar";
import { MOUNT_AT } from "./layout";
import { scrollProgress, watchScroll } from "@/lib/scroll";

/**
 * Gate + Suspense boundary for the floor guitar.
 *
 * The model is 2.2 MB, and it only ever appears at the bottom of the page, so
 * there's no reason to fetch it during first paint. We mount it once the reader
 * has scrolled past MOUNT_AT — early enough that the download finishes before
 * the guitar is due on screen, late enough that it costs the landing view
 * nothing. Once mounted it stays mounted, and the listener detaches.
 */
export function FloorGuitar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    return watchScroll(() => {
      if (scrollProgress() >= MOUNT_AT) setMounted(true);
    });
  }, [mounted]);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <Jaguar />
    </Suspense>
  );
}
