import { useState } from "react";
import { EVENTS, type FestivalEvent } from "@/config/events";
import { Island } from "./Island";
import { FloatingIsland, type IslandAlign } from "./FloatingIsland";
import { ExpandedIsland, type IslandOrigin } from "./ExpandedIsland";
import { islandSummary } from "./summary";
import { untiltedBox } from "./geometry";

const ALIGN: IslandAlign[] = ["flex-start", "flex-end", "center"];
const ROT = [-3, 2.5, -1.5, 3, -2, 1.5];

/**
 * The scroll stream of floating event islands.
 *
 * Reads EVENTS (the derived flat programme) rather than walking SCHEDULE
 * itself, so an island and its detail card are the same entry and can't
 * disagree about what an event is.
 *
 * Two pieces of state: which island the reader last touched (so it lifts clear
 * of its neighbours) and which one is open. The open island's ORIGIN — its
 * on-screen rect and tilt at the moment of the tap — is captured here and
 * handed to ExpandedIsland, which uses it to grow the card out of the island
 * rather than fade a dialog in over it.
 *
 * Sizing and overlap stay in CSS custom properties (see .ags-island-field in
 * global.css) so the phone layout can spread out without duplicating layout
 * logic here.
 */
export function IslandField() {
  const [raisedId, setRaisedId] = useState<string | null>(null);
  const [open, setOpen] = useState<{ event: FestivalEvent; origin: IslandOrigin } | null>(
    null,
  );

  return (
    <>
      <div
        className="ags-island-field"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0svh",
          padding: "6svh clamp(1rem, 5vw, 4rem) 22svh",
        }}
      >
        {EVENTS.map((event, i) => {
          const rotate = ROT[i % ROT.length];
          return (
            <FloatingIsland
              key={event.id}
              index={i}
              align={ALIGN[i % ALIGN.length]}
              rotate={rotate}
              raised={raisedId === event.id}
              onRaise={() => setRaisedId(event.id)}
              onOpen={(el) => {
                setRaisedId(event.id);
                setOpen({
                  event,
                  origin: {
                    box: untiltedBox(el),
                    rotate,
                    // Read lazily on close: by then the page may have scrolled,
                    // and the card should return to the island's real position.
                    liveBox: () => untiltedBox(el),
                  },
                });
              }}
              label={event.title}
            >
              <Island id={event.id} {...islandSummary(event)} />
            </FloatingIsland>
          );
        })}
      </div>

      {open && (
        <ExpandedIsland
          event={open.event}
          origin={open.origin}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
