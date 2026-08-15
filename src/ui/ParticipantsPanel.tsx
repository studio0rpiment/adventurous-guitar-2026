import { useMemo, useState } from "react";
import {
  PARTICIPANTS,
  SORT_LABELS,
  sortParticipants,
  type ParticipantSort,
} from "@/config/participants";
import { ParticipantCard } from "@/ui/ParticipantCard";
import { SortToggle, type SortOption } from "@/ui/SortToggle";

const SORT_OPTIONS: SortOption<ParticipantSort>[] = [
  { value: "alpha", label: SORT_LABELS.alpha },
  { value: "chrono", label: SORT_LABELS.chrono },
];

/**
 * The festival roster, sortable A–Z or by where people fall in the programme.
 * Sort order is local UI state driven by the toggle (event-driven — no timers,
 * no effect syncing); the ordering itself is derived in participants.ts.
 */
export function ParticipantsPanel() {
  const [sort, setSort] = useState<ParticipantSort>("alpha");
  const people = useMemo(() => sortParticipants(PARTICIPANTS, sort), [sort]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          paddingBottom: "0.85rem",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--ags-muted)" }}>
          {people.length} participants
        </span>
        <SortToggle options={SORT_OPTIONS} value={sort} onChange={setSort} />
      </div>

      {people.map((p) => (
        <ParticipantCard key={p.id} participant={p} />
      ))}
    </div>
  );
}
