import { Droplets, Power, CloudRain } from "lucide-react";
import { SensorCard } from "@/components/SensorCard";
import { ControlCard } from "@/components/ControlCard";
import { PageHeader } from "@/components/PageHeader";
import { IrrigationAnalysis } from "@/components/IrrigationAnalysis";
import { SoilMoistureHistory } from "@/components/SoilMoistureHistory";
import { RainfallAnalysis } from "@/components/RainfallAnalysis";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useRainfallData } from "@/hooks/useRainfallData";
import { useDeviceControl } from "@/hooks/useDeviceControl";
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

const Outdoor = () => {
  const [pumpOn, setPumpOn] = useState(false);
  const { data, loading, error } = useFirebaseData();
  const { data: rainfallData, loading: rainfallLoading } = useRainfallData();
  const { history } = useSensorHistory();
  const { sendControlCommand, getAllDeviceStates } = useDeviceControl();
  const { toast } = useToast();
  const rainfallHistoryRef = useRef<Array<{ time: string; intensity: number; isRaining: boolean }>>([]);

  const humidity = data.humidity;

  // Build rainfall history
  useEffect(() => {
    if (!rainfallLoading && rainfallData.timestamp) {
      rainfallHistoryRef.current = [
        ...rainfallHistoryRef.current.slice(-19),
        {
          time: rainfallData.timestamp,
          intensity: rainfallData.rainIntensity,
          isRaining: rainfallData.isRaining
        }
      ];
    }
  }, [rainfallData, rainfallLoading]);

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
        
        {/* Rain Status Banner */}
        {!rainfallLoading && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            rainfallData.isRaining 
              ? 'bg-gradient-to-r from-blue-100 to-sky-100 border border-blue-200' 
              : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              <CloudRain className={`h-6 w-6 ${rainfallData.isRaining ? 'text-blue-500' : 'text-yellow-500'}`} />
              <div>
                <p className="font-medium text-gray-800">
                  {rainfallData.isRaining ? '🌧️ Đang có mưa' : '☀️ Trời không mưa'}
                </p>
                <p className="text-sm text-gray-600">
                  Cường độ: {rainfallData.rainIntensity}%
                </p>
              </div>
            </div>
            <Badge className={rainfallData.isRaining ? 'bg-blue-500' : 'bg-yellow-500'}>
              {rainfallData.isRaining ? 'Mưa' : 'Nắng'}
            </Badge>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SensorCard
            title="Độ Ẩm Đất"
            icon={Droplets}
            value={humidity}
            unit="%"
            iconColor="text-blue-400"
            progress={humidity}
          />
          
          <SensorCard
            title="Cường Độ Mưa"
            icon={CloudRain}
            value={rainfallData.rainIntensity}
            unit="%"
            iconColor="text-sky-500"
            progress={rainfallData.rainIntensity}
          />
          
          <ControlCard
            title="Máy Bơm Nước"
            icon={Power}
            isOn={pumpOn}
            onToggle={handlePumpToggle}
            iconColor="text-secondary"
          />
        </div>

        {/* AI Rainfall Analysis */}
        <div className="mb-6">
          <RainfallAnalysis
            isRaining={rainfallData.isRaining}
            rainIntensity={rainfallData.rainIntensity}
            history={rainfallHistoryRef.current}
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
