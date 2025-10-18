import { useState } from "react";
import { Droplets, Power } from "lucide-react";
import { SensorCard } from "@/components/SensorCard";
import { ControlCard } from "@/components/ControlCard";

const Outdoor = () => {
  const [pumpOn, setPumpOn] = useState(false);
  const humidity = 65;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-secondary to-green-400 bg-clip-text text-transparent">
          Vườn Rau
        </h1>
        <p className="text-muted-foreground mb-8">Giám sát và điều khiển vườn rau</p>
        
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
  );
};

export default Outdoor;
