import { redirect } from "next/navigation";

/** Ayın Ustası yönetimi kaldırıldı — hediye kontör sayfasına yönlendir */
export default function AdminOdullerRedirectPage() {
  redirect("/sltn/hediye-kontor");
}
