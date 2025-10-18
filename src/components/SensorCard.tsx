import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensorCardProps {
  title: string;
  icon: LucideIcon;
  value: number;
  unit: string;
  iconColor?: string;
  progress?: number;
  alert?: boolean;
}

export const SensorCard = ({ 
  title, 
  icon: Icon, 
  value, 
  unit, 
  iconColor = "text-primary",
  progress = 0,
  alert = false
}: SensorCardProps) => {
  return (
    <Card className={cn(
      "p-6 bg-card border-border transition-all hover:shadow-lg",
      alert ? "border-destructive shadow-destructive/20" : "hover:shadow-primary/20"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-lg bg-muted/50", alert && "bg-destructive/10")}>
            <Icon className={cn("w-6 h-6", alert ? "text-destructive" : iconColor)} />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {alert && (
          <span className="text-xs font-semibold text-destructive animate-pulse">
            CẢNH BÁO
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{value}</span>
          <span className="text-xl text-muted-foreground">{unit}</span>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>
    </Card>
  );
};
