import { memo } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger" | "accent";
}

export const StatsCard = memo(function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-4 bg-gradient-card border-border/50",
        "hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p
            className={cn(
              "text-2xl font-bold",
              variant === "success" && "text-success",
              variant === "danger" && "text-destructive",
              variant === "accent" && "text-gradient",
              variant === "default" && "text-foreground"
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "p-2 rounded-lg",
            variant === "success" && "bg-success/20 text-success",
            variant === "danger" && "bg-destructive/20 text-destructive",
            variant === "accent" && "bg-primary/20 text-primary",
            variant === "default" && "bg-secondary text-muted-foreground"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
});
