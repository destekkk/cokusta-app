import { NEW_PIN_LENGTH, sanitizePinDigits } from "@/lib/provider-pin";

type Props = {
  pin: string;
  pinConfirm: string;
  onPinChange: (value: string) => void;
  onPinConfirmChange: (value: string) => void;
  optional?: boolean;
};

export default function AdminPinFields({
  pin,
  pinConfirm,
  onPinChange,
  onPinConfirmChange,
  optional = false,
}: Props) {
  const requiredMark = optional ? "" : " *";
  const placeholder = optional
    ? `Yeni giriş şifresi (${NEW_PIN_LENGTH} hane, boş = değişmez)`
    : `Giriş şifresi (${NEW_PIN_LENGTH} hane)${requiredMark}`;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-sm font-semibold text-foreground">
        Giriş şifresi{optional ? "" : " *"}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          placeholder={placeholder}
          maxLength={NEW_PIN_LENGTH}
          value={pin}
          onChange={(e) => onPinChange(sanitizePinDigits(e.target.value))}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm tracking-widest"
        />
        <input
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          placeholder={optional ? "Şifre tekrar" : "Şifre tekrar *"}
          maxLength={NEW_PIN_LENGTH}
          value={pinConfirm}
          onChange={(e) => onPinConfirmChange(sanitizePinDigits(e.target.value))}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm tracking-widest"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {optional
          ? "Şifre unutulduysa yeni 6 haneli şifre girin. Boş bırakırsanız mevcut şifre kalır."
          : `Panel girişi için ${NEW_PIN_LENGTH} haneli şifre. 111111, 123456, 000000 gibi kolay şifreler kullanılamaz.`}
      </p>
    </div>
  );
}
