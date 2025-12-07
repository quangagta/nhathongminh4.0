import { Card } from "@/components/ui/card";
import { Home, Activity, Thermometer, Flame, Droplets, Leaf, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";
import { useEffect } from "react";
import { toast } from "sonner";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { Progress } from "@/components/ui/progress";

// Optimal values for smart home ecosystem
const OPTIMAL_VALUES = {
  temperature: { min: 22, max: 28, unit: "°C", label: "Nhiệt Độ Trong Nhà" },
  gasLevel: { min: 0, max: 30, unit: "ppm", label: "Khí Gas An Toàn" },
  humidity: { min: 60, max: 80, unit: "%", label: "Độ Ẩm Đất Vườn Rau" },
};

const getStatusInfo = (value: number, min: number, max: number) => {
  if (value >= min && value <= max) {
    return { status: "optimal", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Tối ưu" };
  } else if (value < min * 0.7 || value > max * 1.3) {
    return { status: "critical", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Nguy hiểm" };
  }
  return { status: "warning", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Cần điều chỉnh" };
};

const Info = () => {
  const { data, loading, error } = useFirebaseData();
  
  const temperature = data.temperature;
  const gasLevel = data.gasLevel;
  const humidity = data.humidity;

  const tempStatus = getStatusInfo(temperature, OPTIMAL_VALUES.temperature.min, OPTIMAL_VALUES.temperature.max);
  const gasStatus = getStatusInfo(gasLevel, OPTIMAL_VALUES.gasLevel.min, OPTIMAL_VALUES.gasLevel.max);
  const humidityStatus = getStatusInfo(humidity, OPTIMAL_VALUES.humidity.min, OPTIMAL_VALUES.humidity.max);

  useEffect(() => {
    if (error) {
      toast.error(`Lỗi Firebase: ${error}`);
    }
  }, [error]);

  const OptimalCard = ({ 
    title, 
    icon: Icon, 
    currentValue, 
    optimalMin, 
    optimalMax, 
    unit, 
    iconColor,
    status
  }: {
    title: string;
    icon: React.ElementType;
    currentValue: number;
    optimalMin: number;
    optimalMax: number;
    unit: string;
    iconColor: string;
    status: ReturnType<typeof getStatusInfo>;
  }) => {
    const StatusIcon = status.icon;
    const progress = Math.min(100, Math.max(0, (currentValue / optimalMax) * 100));
    
    return (
      <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${iconColor.replace('text-', 'bg-').replace('-400', '-500/10')}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
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
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Thông Tin Hệ Sinh Thái"
          description="Chỉ số tối ưu cho nhà thông minh và vườn rau"
          gradient="from-primary to-secondary"
        />
        
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Nhà Thông Minh</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" /> Nhiệt độ lý tưởng
                </span>
                <span className="font-semibold">22°C - 28°C</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400" /> Khí gas an toàn
                </span>
                <span className="font-semibold">&lt; 30 ppm</span>
              </div>
              <p className="text-muted-foreground mt-3 pt-3 border-t border-border">
                Duy trì nhiệt độ mát mẻ và không khí sạch để đảm bảo sức khỏe gia đình.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Leaf className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Vườn Rau Thông Minh</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" /> Độ ẩm đất tối ưu
                </span>
                <span className="font-semibold">60% - 80%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" /> Tưới nước tự động
                </span>
                <span className="font-semibold">Khi &lt; 60%</span>
              </div>
              <p className="text-muted-foreground mt-3 pt-3 border-t border-border">
                Độ ẩm đất phù hợp giúp rau phát triển khỏe mạnh và tiết kiệm nước.
              </p>
            </div>
          </Card>
        </div>

        {/* Current Sensor Readings with Optimal Comparison */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">So Sánh Chỉ Số Thực Tế</h2>
          </div>
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OptimalCard
              title="Nhiệt Độ"
              icon={Thermometer}
              currentValue={temperature}
              optimalMin={OPTIMAL_VALUES.temperature.min}
              optimalMax={OPTIMAL_VALUES.temperature.max}
              unit="°C"
              iconColor="text-orange-400"
              status={tempStatus}
            />
            
            <OptimalCard
              title="Khí Gas"
              icon={Flame}
              currentValue={gasLevel}
              optimalMin={OPTIMAL_VALUES.gasLevel.min}
              optimalMax={OPTIMAL_VALUES.gasLevel.max}
              unit="ppm"
              iconColor="text-red-400"
              status={gasStatus}
            />

            <OptimalCard
              title="Độ Ẩm Đất"
              icon={Droplets}
              currentValue={humidity}
              optimalMin={OPTIMAL_VALUES.humidity.min}
              optimalMax={OPTIMAL_VALUES.humidity.max}
              unit="%"
              iconColor="text-blue-400"
              status={humidityStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
