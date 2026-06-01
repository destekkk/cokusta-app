type Props = {
  className?: string;
  compact?: boolean;
};

export default function ParamGuvendePitch({ className = "", compact = false }: Props) {
  if (compact) {
    return (
      <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
        <span className="font-semibold text-foreground">Neden Param Güvende?</span> Paranız iş
        bitene kadar havuzda güvende kalır; siz &quot;İş bitti&quot; deyince ustaya aktarılır.
      </p>
    );
  }

  return (
    <div
      className={`rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground ${className}`}
    >
      <p className="font-semibold text-foreground">Neden Param Güvende?</p>
      <p className="mt-1">
        Ödemeniz iş tamamlanana kadar bizim güvencemizde tutulur. Usta işi bitirir, siz kontrol
        edip onaylarsınız — ancak o zaman para ustaya geçer. Böylece hem dolandırıcılığa karşı
        korunursunuz hem de usta, ödemenin geleceğini bilerek çalışır.
      </p>
    </div>
  );
}
