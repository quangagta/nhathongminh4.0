import { Thermometer, Flame, Droplets, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { OptimalCard, getStatusInfo } from "./OptimalCard";

const OPTIMAL_VALUES = {
  temperature: { min: 22, max: 28, unit: "°C", label: "Nhiệt Độ Trong Nhà" },
  gasLevel: { min: 0, max: 30, unit: "ppm", label: "Khí Gas An Toàn" },
  humidity: { min: 60, max: 80, unit: "%", label: "Độ Ẩm Đất Vườn Rau" },
};

export const SensorComparison = () => {
  const { data } = useFirebaseData();
  
  const temperature = data.temperature;
  const gasLevel = data.gasLevel;
  const humidity = data.humidity;

  const tempStatus = getStatusInfo(temperature, OPTIMAL_VALUES.temperature.min, OPTIMAL_VALUES.temperature.max);
  const gasStatus = getStatusInfo(gasLevel, OPTIMAL_VALUES.gasLevel.min, OPTIMAL_VALUES.gasLevel.max);
  const humidityStatus = getStatusInfo(humidity, OPTIMAL_VALUES.humidity.min, OPTIMAL_VALUES.humidity.max);

  return (
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
  );
};
