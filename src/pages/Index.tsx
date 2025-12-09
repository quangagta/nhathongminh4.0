import { SensorChart } from "@/components/SensorChart";
import { EcosystemOverview } from "@/components/EcosystemOverview";
import { SensorComparison } from "@/components/SensorComparison";
import { AIAnalysisTabs } from "@/components/AIAnalysisTabs";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Activity, Leaf, Settings, CloudRain } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRainfallData } from "@/hooks/useRainfallData";
import { Badge } from "@/components/ui/badge";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { useTemperatureHistory } from "@/hooks/useTemperatureHistory";
import smartHomeModel from "@/assets/smart-home-header.png";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const { data } = useFirebaseData();
  const { history } = useSensorHistory();
  const { data: rainfallData, loading: rainfallLoading } = useRainfallData();
  const rainfallHistoryRef = useRef<Array<{ time: string; intensity: number; isRaining: boolean }>>([]);
  useTemperatureHistory(); // Auto-save temperature to database

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
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Transform history for irrigation analysis
  const humidityHistory = history.map(h => ({
    time: h.time,
    humidity: h.humidity,
    temperature: h.temperature
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Settings Button - Top Left */}
      <div className="fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm shadow-lg border-border/50 hover:bg-primary/10">
              <Settings className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 sm:w-96 p-0 overflow-y-auto">
            <div className="p-4 pb-8">
              <SettingsPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Hero Header with Parallax Image */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <img 
          src={smartHomeModel} 
          alt="Mô hình nhà thông minh" 
          className="w-full h-[120%] object-cover absolute top-0 left-0"
          style={{ 
            transform: `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0005})`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div 
          className="absolute bottom-0 left-0 right-0 p-6 text-center"
          style={{ 
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: Math.max(0, 1 - scrollY * 0.003)
          }}
        >
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Hệ thống hoạt động</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
            Solar IoT EcoHome
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-lg mx-auto">
            Nhà thông minh tích hợp vườn rau tự động và hệ thống năng lượng mặt trời
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Điều khiển và giám sát thiết bị Arduino của bạn mọi lúc, mọi nơi
            </p>
          </div>

          {/* Rain Status Banner */}
          {!rainfallLoading && (
            <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              rainfallData.isRaining 
                ? 'bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 border border-blue-200 dark:border-blue-700' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700'
            }`}>
              <div className="flex items-center gap-3">
                <CloudRain className={`h-6 w-6 ${rainfallData.isRaining ? 'text-blue-500' : 'text-yellow-500'}`} />
                <div>
                  <p className="font-medium text-foreground">
                    {rainfallData.isRaining ? '🌧️ Đang có mưa' : '☀️ Trời không mưa'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cường độ: {rainfallData.rainIntensity}%
                  </p>
                </div>
              </div>
              <Badge className={rainfallData.isRaining ? 'bg-blue-500' : 'bg-yellow-500'}>
                {rainfallData.isRaining ? 'Mưa' : 'Nắng'}
              </Badge>
            </div>
          )}

          {/* Ecosystem Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold">Chỉ Số Tối Ưu Hệ Sinh Thái</h2>
            </div>
            <EcosystemOverview />
          </div>

          {/* AI Analysis Section with Tabs */}
          <div className="mb-8">
            <AIAnalysisTabs
              temperature={data.temperature}
              gasLevel={data.gasLevel}
              humidity={data.humidity}
              sensorHistory={history.map(h => ({ temperature: h.temperature, gasLevel: h.gasLevel }))}
              humidityHistory={humidityHistory}
              rainfallData={{
                isRaining: rainfallData.isRaining,
                rainIntensity: rainfallData.rainIntensity
              }}
              rainfallHistory={rainfallHistoryRef.current}
            />
          </div>

          {/* Sensor Comparison */}
          <div className="mb-8">
            <SensorComparison />
          </div>

          {/* Sensor Chart with History */}
          <div>
            <SensorChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
