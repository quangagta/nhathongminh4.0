import { Lightbulb, Fan, Thermometer, Flame } from "lucide-react";
import { SensorCard } from "@/components/SensorCard";
import { ControlCard } from "@/components/ControlCard";
import { DoorControl } from "@/components/DoorControl";
import { DoorHistory } from "@/components/DoorHistory";
import { PageHeader } from "@/components/PageHeader";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useDeviceControl } from "@/hooks/useDeviceControl";
import { useDoorControl } from "@/hooks/useDoorControl";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const Indoor = () => {
  const [lightOn, setLightOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const { data, loading, error } = useFirebaseData();
  const { sendControlCommand, getAllDeviceStates } = useDeviceControl();
  const { history } = useDoorControl();
  const { toast } = useToast();

  const temperature = data.temperature;
  const gasLevel = data.gasLevel;

  // Load trạng thái thiết bị từ Firebase khi khởi động
  useEffect(() => {
    const loadDeviceStates = async () => {
      const states = await getAllDeviceStates();
      setLightOn(states.light1);
      setFanOn(states.fan);
    };
    loadDeviceStates();
  }, []);

  // Xử lý toggle đèn
  const handleLightToggle = async (newState: boolean) => {
    setLightOn(newState);
    await sendControlCommand('light1', newState);
  };

  // Xử lý toggle quạt
  const handleFanToggle = async (newState: boolean) => {
    setFanOn(newState);
    await sendControlCommand('fan', newState);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Trong Nhà"
          description="Điều khiển thiết bị trong nhà"
          gradient="from-primary to-accent"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <DoorControl />
          </div>
          
          <div className="md:col-span-2">
            <DoorHistory history={history} />
          </div>
          
          <ControlCard
            title="Đèn"
            icon={Lightbulb}
            isOn={lightOn}
            onToggle={handleLightToggle}
            iconColor="text-yellow-400"
          />
          
          <ControlCard
            title="Quạt"
            icon={Fan}
            isOn={fanOn}
            onToggle={handleFanToggle}
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
