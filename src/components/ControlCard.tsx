import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlCardProps {
  title: string;
  icon: LucideIcon;
  isOn: boolean;
  onToggle: (value: boolean) => void;
  iconColor?: string;
}

export const ControlCard = ({ 
  title, 
  icon: Icon, 
  isOn, 
  onToggle,
  iconColor = "text-primary"
}: ControlCardProps) => {
  return (
    <Card className={cn(
      "p-6 bg-card border-border transition-all hover:shadow-lg",
      isOn ? "shadow-primary/20 border-primary/50" : "hover:shadow-primary/10"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-lg transition-all",
            isOn ? "bg-primary/20" : "bg-muted/50"
          )}>
            <Icon className={cn(
              "w-6 h-6 transition-all",
              isOn ? iconColor : "text-muted-foreground",
              isOn && "drop-shadow-lg"
            )} />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Switch checked={isOn} onCheckedChange={onToggle} />
      </div>
      
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full transition-all",
          isOn ? "bg-primary animate-pulse" : "bg-muted-foreground"
        )}></div>
        <span className={cn(
          "text-sm font-medium transition-colors",
          isOn ? "text-primary" : "text-muted-foreground"
        )}>
          {isOn ? "Đang bật" : "Đang tắt"}
        </span>
      </div>
    </Card>
  );
};
