import { Card } from "@/components/ui/card";
import { Home, Wifi, Activity, Thermometer, Flame, Droplets } from "lucide-react";
import { SensorCard } from "@/components/SensorCard";
import { Separator } from "@/components/ui/separator";

const Info = () => {
  // Sensor values
  const temperature = 26;
  const gasLevel = 15;
  const humidity = 65;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Thông Tin Tổng Quan
        </h1>
        <p className="text-muted-foreground mb-8">Toàn bộ thông tin vườn rau và trong nhà</p>
        
        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Địa Chỉ</h3>
            </div>
            <p className="text-muted-foreground">123 Đường ABC, Quận XYZ, TP.HCM</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Wifi className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Kết Nối</h3>
            </div>
            <p className="text-muted-foreground">Arduino ESP32 - WiFi</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-sm text-secondary">Đang hoạt động</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Trạng Thái</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trong nhà:</span>
                <span className="font-semibold text-foreground">4/4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vườn rau:</span>
                <span className="font-semibold text-foreground">2/2</span>
              </div>
            </div>
          </Card>
        </div>

        {/* All Sensor Readings */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Chỉ Số Cảm Biến</h2>
          </div>
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SensorCard
              title="Nhiệt Độ Trong Nhà"
              icon={Thermometer}
              value={temperature}
              unit="°C"
              iconColor="text-orange-400"
              progress={temperature / 50 * 100}
            />
            
            <SensorCard
              title="Khí Gas Trong Nhà"
              icon={Flame}
              value={gasLevel}
              unit="ppm"
              iconColor="text-red-400"
              progress={gasLevel / 100 * 100}
              alert={gasLevel > 50}
            />

            <SensorCard
              title="Độ Ẩm Đất Vườn Rau"
              icon={Droplets}
              value={humidity}
              unit="%"
              iconColor="text-blue-400"
              progress={humidity}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
