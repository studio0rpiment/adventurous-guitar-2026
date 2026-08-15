import { useState } from "react";
import { SCHEDULE, ONGOING } from "@/config/sections";
import { Island } from "./Island";
import { FloatingIsland, type IslandAlign } from "./FloatingIsland";

type Spec = { id: string; top?: string; title: string; sub?: string; note?: string };

// One island per event (per day). Venues removed for now.
function buildSpecs(): Spec[] {
  const specs: Spec[] = [];
  ONGOING.forEach((o, i) =>
    specs.push({ id: `ong${i}`, top: o.when, title: o.title, sub: o.venue, note: o.note }),
  );
  SCHEDULE.forEach((day) =>
    day.blocks.forEach((b) =>
      b.slots.forEach((s, i) =>
        specs.push({
          id: `${day.date}${b.venue}${i}`.replace(/\W+/g, "").toLowerCase(),
          top: `${day.date} · ${s.time}`,
          title: s.title,
          sub: s.performers ?? b.venue,
          note: s.performers ? b.venue : s.note,
        }),
      ),
    ),
  );
  return specs;
}

const SPECS = buildSpecs();
const ALIGN: IslandAlign[] = ["flex-start", "flex-end", "center"];
const ROT = [-3, 2.5, -1.5, 3, -2, 1.5];

/**
 * The scroll stream of floating event islands.
 *
 * Owns one piece of state: which island the reader last touched, so it can be
 * lifted clear of its neighbours. Sizing/overlap live in CSS custom properties
 * (see .ags-island-field in global.css) so the phone layout can spread out
 * without duplicating the layout logic here.
 */
export function IslandField() {
  const [raisedId, setRaisedId] = useState<string | null>(null);

  return (
    <div
      className="ags-island-field"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0svh",
        padding: "6svh clamp(1rem, 5vw, 4rem) 22svh",
      }}
    >
      {SPECS.map((s, i) => (
        <FloatingIsland
          key={s.id}
          index={i}
          align={ALIGN[i % ALIGN.length]}
          rotate={ROT[i % ROT.length]}
          raised={raisedId === s.id}
          onRaise={() => setRaisedId(s.id)}
          label={s.title}
        >
          <Island {...s} />
        </FloatingIsland>
      ))}
    </div>
  );
}
