import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function ChartCard({
  title,
  description,
  children,
  height = 280,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </CardHeader>
      <CardContent>
        <div style={{ height }} role="img" aria-label={title}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
