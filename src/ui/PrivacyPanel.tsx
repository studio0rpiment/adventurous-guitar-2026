import { CONTROLLER, PEOPLE, WEBSITE, type PrivacySection } from "@/config/privacy";
import { COLOPHON, MODELS } from "@/config/colophon";
import { ExtLink } from "@/ui/ExtLink";

/**
 * Privacy notice and personal-data statement, in the shared panel shell.
 *
 * Presentational — every word lives in config/privacy.ts and config/colophon.ts,
 * same split as the schedule and roster panels.
 *
 * Three parts: what happens when you visit (almost nothing), what is published
 * about the people in the programme (the part that actually matters), and how
 * the site was made — including the AI disclosure. That last part sits here
 * rather than in About because About is about the FESTIVAL; this panel is the
 * one that answers questions about the website.
 */
function Sections({ sections }: { sections: PrivacySection[] }) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.heading} className="ags-legal__section">
          <h4 className="ags-legal__h">{s.heading}</h4>
          {s.paras?.map((p, i) => (
            <p key={i} className="ags-legal__para">
              {p}
            </p>
          ))}
          {s.list && (
            <ul className="ags-legal__list">
              {s.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {s.after?.map((p, i) => (
            <p key={i} className="ags-legal__para">
              {p}
            </p>
          ))}
        </section>
      ))}
    </>
  );
}

export function PrivacyPanel() {
  return (
    <div className="ags-legal">
      <h3 className="ags-legal__title">Privacy notice</h3>
      <Sections sections={WEBSITE} />

      <h3 className="ags-legal__title">Personal data of festival participants</h3>
      <Sections sections={PEOPLE} />

      <h3 className="ags-legal__title">{COLOPHON.heading}</h3>
      <section className="ags-legal__section">
        {[...COLOPHON.intro, ...COLOPHON.ai].map((para, i) => (
          <p key={i} className="ags-legal__para">
            {para}
          </p>
        ))}

        <dl className="ags-colophon__credits">
          {COLOPHON.credits.map((c) => (
            <div key={c.label} className="ags-colophon__row">
              <dt className="ags-colophon__label">{c.label}</dt>
              <dd className="ags-colophon__value">
                {c.url ? <ExtLink href={c.url} label={c.value} /> : c.value}
              </dd>
            </div>
          ))}
          {MODELS.map((m) => (
            <div key={m.url} className="ags-colophon__row">
              <dt className="ags-colophon__label">3D model</dt>
              <dd className="ags-colophon__value">
                <ExtLink href={m.url} label={m.title} /> by {m.author} —{" "}
                <ExtLink href={m.licenseUrl} label={m.license} />
                {m.modified && ", modified"}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="ags-legal__contact">
        {CONTROLLER.name} · <ExtLink href={CONTROLLER.url} label="orpiment.studio" />
        {" · "}
        <a className="ags-link" href={`mailto:${CONTROLLER.email}`}>
          {CONTROLLER.email}
        </a>
      </p>
    </div>
  );
}
