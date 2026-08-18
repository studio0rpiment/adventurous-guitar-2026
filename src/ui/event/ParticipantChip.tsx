import type { Participant } from "@/config/participants";

/**
 * One name in an event's line-up: the tappable header of a bio.
 *
 * Just the name and role, set like everything else on the card. It carried a
 * portrait at first, which made the line-up read as a different component
 * dropped into the middle of the page — a list widget among centred type. The
 * roster panel is where faces belong; here a name is enough, and it's the thing
 * you're tapping anyway.
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
  const { name, role } = participant;

  return (
    <button
      type="button"
      className="ags-person"
      data-open={open || undefined}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className="ags-person__name">{name}</span>
      {role && <span className="ags-person__role">{role}</span>}
    </button>
  );
}
