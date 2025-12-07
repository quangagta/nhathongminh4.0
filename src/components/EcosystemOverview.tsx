import { Card } from "@/components/ui/card";
import { Home, Activity, Thermometer, Flame, Droplets, Leaf } from "lucide-react";

export const EcosystemOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-border shadow-card hover:shadow-card-hover hover:shadow-primary/15 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-inner-light">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Nhà Thông Minh</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" /> Nhiệt độ lý tưởng
              </span>
              <span className="font-semibold text-foreground">22°C - 28°C</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" /> Khí gas an toàn
              </span>
              <span className="font-semibold text-foreground">&lt; 30 ppm</span>
            </div>
            <p className="text-muted-foreground mt-3 pt-3 border-t border-border/50">
              Duy trì nhiệt độ mát mẻ và không khí sạch để đảm bảo sức khỏe gia đình.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-card to-secondary/5 border-border shadow-card hover:shadow-card-hover hover:shadow-secondary/15 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 shadow-inner-light">
              <Leaf className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold">Vườn Rau Thông Minh</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" /> Độ ẩm đất tối ưu
              </span>
              <span className="font-semibold text-foreground">60% - 80%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" /> Tưới nước tự động
              </span>
              <span className="font-semibold text-foreground">Khi &lt; 60%</span>
            </div>
            <p className="text-muted-foreground mt-3 pt-3 border-t border-border/50">
              Độ ẩm đất phù hợp giúp rau phát triển khỏe mạnh và tiết kiệm nước.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
