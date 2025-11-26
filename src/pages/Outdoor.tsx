import { Droplets, Power } from "lucide-react";
import { SensorCard } from "@/components/SensorCard";
import { ControlCard } from "@/components/ControlCard";
import { PageHeader } from "@/components/PageHeader";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useDeviceControl } from "@/hooks/useDeviceControl";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const Outdoor = () => {
  const [pumpOn, setPumpOn] = useState(false);
  const { data, loading, error } = useFirebaseData();
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
          title="Vườn Rau"
          description="Giám sát và điều khiển vườn rau"
          gradient="from-secondary to-green-400"
        />
        
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
            onToggle={handlePumpToggle}
            iconColor="text-secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default Outdoor;
