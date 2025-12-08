import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SensorChart } from "@/components/SensorChart";
import { EcosystemOverview } from "@/components/EcosystemOverview";
import { SensorComparison } from "@/components/SensorComparison";
import { FireRiskAnalysis } from "@/components/FireRiskAnalysis";
import { Home, TreePine, Info, Activity, Leaf, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { useSensorHistory } from "@/hooks/useSensorHistory";
import smartHomeModel from "@/assets/smart-home-header.png";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const { data } = useFirebaseData();
  const { history } = useSensorHistory();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
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

          {/* Ecosystem Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold">Chỉ Số Tối Ưu Hệ Sinh Thái</h2>
            </div>
            <EcosystemOverview />
          </div>

          {/* AI Fire Risk Analysis */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">AI Phân Tích Nguy Cơ Cháy</h2>
            </div>
            <FireRiskAnalysis 
              temperature={data.temperature}
              gasLevel={data.gasLevel}
              history={history.map(h => ({ temperature: h.temperature, gasLevel: h.gasLevel }))}
            />
          </div>

          {/* Sensor Comparison */}
          <div className="mb-8">
            <SensorComparison />
          </div>

          {/* Sensor Chart */}
          <div>
            <SensorChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
