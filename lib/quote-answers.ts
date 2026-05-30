import { getServiceBySlug } from "@/lib/data/services";
import type { QuoteRequest } from "@/lib/types";

export type QuoteAnswer = {
  label: string;
  value: string;
};

export function getQuoteAnswers(quote: QuoteRequest): QuoteAnswer[] {
  const service = getServiceBySlug(quote.serviceSlug);

  if (!service) {
    return Object.entries(quote.answers).map(([key, value]) => ({
      label: key,
      value,
    }));
  }

  return service.questions
    .filter((question) => quote.answers[question.id])
    .map((question) => {
      const raw = quote.answers[question.id];
      const optionLabel = question.options?.find((option) => option.value === raw)?.label;

      return {
        label: question.label,
        value: optionLabel ?? raw,
      };
    });
}
