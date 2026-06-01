export const PROVIDER_PHONE_EXISTS = "PROVIDER_PHONE_EXISTS";

export function providerPhoneExistsUserMessage(
  status?: "pending" | "approved" | "rejected"
): string {
  if (status === "pending") {
    return "Bu telefon numarasıyla zaten usta başvurusu var ve inceleniyor. Onay sonrası usta girişinden devam edebilirsiniz.";
  }
  if (status === "rejected") {
    return "Bu telefon numarasıyla daha önce reddedilmiş bir usta başvurusu var. Destek ile iletişime geçin.";
  }
  return "Bu telefon numarasıyla zaten usta kaydı var. Usta girişinden devam edin.";
}
