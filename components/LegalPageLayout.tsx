import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function LegalPageLayout({ title, description, children }: Props) {
  return (
    <div className="min-h-full bg-background">
      <Header />

      <div className="border-b border-border bg-secondary px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-3 text-base text-white/75 sm:text-lg">{description}</p>
          )}
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="prose-legal space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {children}
        </div>
      </article>

      <Footer />
    </div>
  );
}
