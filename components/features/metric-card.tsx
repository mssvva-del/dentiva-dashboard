import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "teal" | "gold" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-2 font-display text-4xl font-semibold text-navy",
            accent === "teal" && "text-teal",
            accent === "gold" && "text-gold",
            accent === "destructive" && "text-destructive"
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
