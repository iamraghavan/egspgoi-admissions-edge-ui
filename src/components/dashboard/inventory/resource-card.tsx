import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResourceCardProps {
  title: string;
  count: number;
  details: {
    label: string;
    value: string | number;
  }[];
}

export default function ResourceCard({ title, count, details }: ResourceCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-lg font-bold">{count}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between">
              <span>{detail.label}</span>
              {detail.value && <span className="font-medium text-foreground">{detail.value}</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
