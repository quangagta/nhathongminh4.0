import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Lightbulb, Fan, Thermometer, Flame } from "lucide-react";
import { SensorCard } from "@/components/SensorCard";
import { ControlCard } from "@/components/ControlCard";

const Indoor = () => {
  const [lightOn, setLightOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const temperature = 26;
  const gasLevel = 15;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Trong Nhà
        </h1>
        <p className="text-muted-foreground mb-8">Điều khiển thiết bị trong nhà</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
};

export default Indoor;
