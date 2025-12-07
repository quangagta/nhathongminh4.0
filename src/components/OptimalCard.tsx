import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const getStatusInfo = (value: number, min: number, max: number) => {
  if (value >= min && value <= max) {
    return { status: "optimal", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Tối ưu" };
  } else if (value < min * 0.7 || value > max * 1.3) {
    return { status: "critical", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Nguy hiểm" };
  }
  return { status: "warning", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Cần điều chỉnh" };
};

interface OptimalCardProps {
  title: string;
  icon: React.ElementType;
  currentValue: number;
  optimalMin: number;
  optimalMax: number;
  unit: string;
  iconColor: string;
  status: ReturnType<typeof getStatusInfo>;
}

export const OptimalCard = ({ 
  title, 
  icon: Icon, 
  currentValue, 
  optimalMin, 
  optimalMax, 
  unit, 
  iconColor,
  status
}: OptimalCardProps) => {
  const StatusIcon = status.icon;
  const progress = Math.min(100, Math.max(0, (currentValue / optimalMax) * 100));
  
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-border shadow-card hover:shadow-card-hover transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full group-hover:from-primary/10 transition-colors duration-300"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl shadow-inner-light ${iconColor.replace('text-', 'bg-').replace('-400', '-500/15')}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} backdrop-blur-sm`}>
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>
      
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Giá trị hiện tại</p>
              <p className="text-3xl font-bold">{currentValue}<span className="text-lg text-muted-foreground ml-1">{unit}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Khoảng tối ưu</p>
              <p className="text-lg font-semibold text-primary">{optimalMin} - {optimalMax}{unit}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0{unit}</span>
              <span>{optimalMax * 1.5}{unit}</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              {/* Optimal range indicator */}
              <div 
                className="absolute top-0 h-3 border-2 border-green-500 rounded-sm opacity-60"
                style={{
                  left: `${(optimalMin / (optimalMax * 1.5)) * 100}%`,
                  width: `${((optimalMax - optimalMin) / (optimalMax * 1.5)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
