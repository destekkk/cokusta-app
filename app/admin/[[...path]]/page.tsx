import { notFound } from "next/navigation";

/** Eski /admin URL — panele yönlendirilmez, 404 döner */
export default function AdminDeprecatedPage() {
  notFound();
}
