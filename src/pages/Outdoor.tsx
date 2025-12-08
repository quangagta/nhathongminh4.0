import { Droplets, Power } from "lucide-react";
import { SensorCard } from "@/components/SensorCard";
import { ControlCard } from "@/components/ControlCard";
import { PageHeader } from "@/components/PageHeader";
import { IrrigationAnalysis } from "@/components/IrrigationAnalysis";
import { SoilMoistureHistory } from "@/components/SoilMoistureHistory";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useDeviceControl } from "@/hooks/useDeviceControl";
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const Outdoor = () => {
  const [pumpOn, setPumpOn] = useState(false);
  const { data, loading, error } = useFirebaseData();
  const { history } = useSensorHistory();
  const { sendControlCommand, getAllDeviceStates } = useDeviceControl();
  const { toast } = useToast();

  const humidity = data.humidity;

  // Load trạng thái thiết bị từ Firebase khi khởi động
  useEffect(() => {
    const loadDeviceStates = async () => {
      const states = await getAllDeviceStates();
      setPumpOn(states.pump);
    };
    loadDeviceStates();
  }, []);

  // Xử lý toggle bơm nước
  const handlePumpToggle = async (newState: boolean) => {
    setPumpOn(newState);
    await sendControlCommand('pump', newState);
  };

  // Auto water callback from AI
  const handleAutoWater = (shouldWater: boolean) => {
    if (shouldWater && !pumpOn) {
      toast({
        title: "AI Đề xuất tưới",
        description: "Bật máy bơm để tưới cây theo đề xuất AI?",
      });
    }
  };

  // Handle water now from alerts
  const handleWaterNow = () => {
    if (!pumpOn) {
      handlePumpToggle(true);
      toast({
        title: "Đã bật máy bơm",
        description: "Máy bơm đang tưới cây. Nhớ tắt khi đủ nước!",
      });
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Lỗi kết nối",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Transform history for irrigation analysis
  const humidityHistory = history.map(h => ({
    time: h.time,
    humidity: h.humidity,
    temperature: h.temperature
  }));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Vườn Rau"
          description="Giám sát và điều khiển vườn rau thông minh với AI"
          gradient="from-secondary to-green-400"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
            onToggle={handlePumpToggle}
            iconColor="text-secondary"
          />
        </div>

        {/* AI Irrigation Analysis */}
        <div className="mb-6">
          <IrrigationAnalysis
            humidity={humidity}
            temperature={data.temperature}
            history={humidityHistory}
            onAutoWater={handleAutoWater}
          />
        </div>

        {/* Soil Moisture History & Smart Alerts */}
        <SoilMoistureHistory
          currentHumidity={humidity}
          currentTemperature={data.temperature}
          history={humidityHistory}
          onWaterNow={handleWaterNow}
        />
      </div>
    </div>
  );
};

export default Outdoor;
