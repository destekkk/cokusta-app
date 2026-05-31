type Props = {
  currentStep?: 1 | 2 | 3;
};

const steps = [
  { step: 1 as const, label: "Hizmet seçin" },
  { step: 2 as const, label: "Bilgilerinizi girin" },
  { step: 3 as const, label: "Teklif alın" },
];

export default function QuoteFlowSteps({ currentStep = 1 }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-2">
      {steps.map(({ step, label }, index) => {
        const isActive = step === currentStep;
        const isDone = step < currentStep;

        return (
          <div key={step} className="flex items-center gap-2 sm:gap-3">
            {index > 0 && (
              <span className="hidden h-px w-6 bg-border sm:block" aria-hidden />
            )}
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                isActive
                  ? "border-primary bg-primary/10 font-semibold text-primary"
                  : isDone
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-primary text-white"
                    : isDone
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : step}
              </span>
              <span>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
