type FaqItem = { question: string; answer: string };

type Props = {
  items: FaqItem[];
};

export default function SeoFaq({ items }: Props) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-foreground">Sık Sorulan Sorular</h2>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <details
            key={item.question}
            className="group border border-border bg-card"
          >
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-foreground marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span className="text-muted-foreground transition group-open:rotate-180">▾</span>
              </span>
            </summary>
            <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FaqJsonLd({ items }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
