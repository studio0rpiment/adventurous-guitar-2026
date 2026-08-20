/**
 * Long-form text split on blank lines into paragraphs.
 *
 * The one rule for body copy — `\n\n` in an authored string is a paragraph
 * break — used to be implemented twice (the event abstract in EventDetail and
 * the bio in ParticipantBio), which is how the two would eventually split on
 * different regexes. This is that rule as its own atom.
 */
export function Paras({
  text,
  className = "ags-event__para",
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      {text.split(/\n\s*\n/).map((para, i) => (
        <p key={i} className={className}>
          {para}
        </p>
      ))}
    </>
  );
}
