import { Card } from "@/components/ui/card";
import { Home, Activity, Thermometer, Flame, Droplets, Leaf } from "lucide-react";

export const EcosystemOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-secondary/20 transition-all">
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
  );
};
