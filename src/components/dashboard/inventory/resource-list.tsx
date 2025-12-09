import type { InventoryResource } from "@/lib/types";

interface ResourceListProps {
  resources: InventoryResource[];
}

export default function ResourceList({ resources }: ResourceListProps) {
  return (
    <div className="flex flex-col justify-center h-full">
      <ul className="space-y-3">
        {resources.map((resource) => (
          <li key={resource.name} className="flex justify-between items-center text-sm">
            <span>{resource.name}</span>
            <span className="font-bold text-lg">{resource.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
