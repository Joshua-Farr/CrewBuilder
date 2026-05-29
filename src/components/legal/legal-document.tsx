import type { LegalSection } from "@/lib/legal/types";

interface LegalDocumentProps {
  sections: LegalSection[];
  lastUpdated: string;
}

export function LegalDocument({ sections, lastUpdated }: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.title}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${section.id}-p-${index}`} className="leading-7 text-muted-foreground">
              {paragraph}
            </p>
          ))}
          {section.listItems ? (
            <ul className="list-disc space-y-2 pl-6 leading-7 text-muted-foreground">
              {section.listItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
