import type { Participant } from "@/config/participants";
import { ParticipantFace } from "@/ui/ParticipantFace";

/**
 * One tappable participant in an event's line-up: portrait (or initials) plus
 * name, acting as the header of an accordion.
 *
 * Presentational: the face (and its initials fallback) is ParticipantFace's
 * job, and what opens underneath is the caller's.
 */
export function ParticipantChip({
  participant,
  open,
  onToggle,
}: {
  participant: Participant;
  open: boolean;
  onToggle: () => void;
}) {
  const { name, image, role } = participant;

  return (
    <button
      type="button"
      className="ags-chip"
      data-open={open || undefined}
      aria-expanded={open}
      onClick={onToggle}
    >
      <ParticipantFace name={name} image={image} size="2.15rem" />
      <span className="ags-chip__text">
        <span className="ags-chip__name">{name}</span>
        {role && <span className="ags-chip__role">{role}</span>}
      </span>
    </button>
  );
}
