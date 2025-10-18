import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Home, Wifi, Activity, Lightbulb, Fan, Thermometer, Flame, Droplets, Power } from "lucide-react";
import { SensorCard } from "@/components/SensorCard";
import { ControlCard } from "@/components/ControlCard";
import { Separator } from "@/components/ui/separator";

const Info = () => {
  // Indoor states
  const [lightOn, setLightOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const temperature = 26;
  const gasLevel = 15;

  // Outdoor states
  const [pumpOn, setPumpOn] = useState(false);
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

        {/* Indoor Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Trong Nhà</h2>
          </div>
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ControlCard
              title="Đèn"
              icon={Lightbulb}
              isOn={lightOn}
              onToggle={setLightOn}
              iconColor="text-yellow-400"
            />
            
            <ControlCard
              title="Quạt"
              icon={Fan}
              isOn={fanOn}
              onToggle={setFanOn}
              iconColor="text-blue-400"
            />
            
            <SensorCard
              title="Nhiệt Độ"
              icon={Thermometer}
              value={temperature}
              unit="°C"
              iconColor="text-orange-400"
              progress={temperature / 50 * 100}
            />
            
            <SensorCard
              title="Khí Gas"
              icon={Flame}
              value={gasLevel}
              unit="ppm"
              iconColor="text-red-400"
              progress={gasLevel / 100 * 100}
              alert={gasLevel > 50}
            />
          </div>
        </div>

        {/* Outdoor Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold">Vườn Rau</h2>
          </div>
          <Separator className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SensorCard
              title="Độ Ẩm Đất"
              icon={Droplets}
              value={humidity}
              unit="%"
              iconColor="text-blue-400"
              progress={humidity}
            />
            
            <ControlCard
              title="Máy Bơm Nước"
              icon={Power}
              isOn={pumpOn}
              onToggle={setPumpOn}
              iconColor="text-secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
