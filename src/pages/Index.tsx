import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SensorChart } from "@/components/SensorChart";
import { EcosystemOverview } from "@/components/EcosystemOverview";
import { SensorComparison } from "@/components/SensorComparison";
import { FireRiskAnalysis } from "@/components/FireRiskAnalysis";
import { IrrigationAnalysis } from "@/components/IrrigationAnalysis";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Home, TreePine, Info, Activity, Leaf, Brain, Droplets, Settings } from "lucide-react";
import { useState, useEffect } from "react";
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
  useTemperatureHistory(); // Auto-save temperature to database

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

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link to="/indoor">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50">
                    <Home className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Trong Nhà</h3>
                    <p className="text-sm text-muted-foreground">Đèn, quạt, khóa cửa</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link to="/outdoor">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                    <TreePine className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Vườn Rau</h3>
                    <p className="text-sm text-muted-foreground">Máy bơm, mưa, độ ẩm</p>
                  </div>
                </div>
              </Card>
            </Link>
            
            <Link to="/info">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Thông Tin</h3>
                    <p className="text-sm text-muted-foreground">Chỉ số tối ưu hệ sinh thái</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Ecosystem Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold">Chỉ Số Tối Ưu Hệ Sinh Thái</h2>
            </div>
            <EcosystemOverview />
          </div>

          {/* AI Analysis Section - 2 columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* AI Fire Risk Analysis */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">AI Phân Tích Nguy Cơ Cháy</h2>
              </div>
              <FireRiskAnalysis 
                temperature={data.temperature}
                gasLevel={data.gasLevel}
                history={history.map(h => ({ temperature: h.temperature, gasLevel: h.gasLevel }))}
              />
            </div>

            {/* AI Soil Moisture Analysis */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold">AI Phân Tích Độ Ẩm Đất</h2>
              </div>
              <IrrigationAnalysis
                humidity={data.humidity}
                temperature={data.temperature}
                history={humidityHistory}
              />
            </div>
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
