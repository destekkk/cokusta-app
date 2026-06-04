import { revalidatePath } from "next/cache";

/** Admin paneli sunucu bileşenlerini günceller (router.refresh ile birlikte). */
export function revalidateAdminPages() {
  revalidatePath("/sltn", "layout");
}
