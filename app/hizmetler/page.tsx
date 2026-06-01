import ServicePickList from "@/components/ServicePickList";
import { categories } from "@/lib/data/categories";
import { getServicesByCategory } from "@/lib/data/services";

export default function AllServicesPage() {
  const sections = categories
    .map((category) => ({
      category,
      services: getServicesByCategory(category.slug),
    }))
    .filter((section) => section.services.length > 0);

  return <ServicePickList sections={sections} />;
}
