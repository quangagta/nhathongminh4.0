import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SensorChart } from "@/components/SensorChart";
import { EcosystemOverview } from "@/components/EcosystemOverview";
import { SensorComparison } from "@/components/SensorComparison";
import { Home, TreePine, Info, Activity, Leaf } from "lucide-react";
import { useState, useEffect } from "react";
import smartHomeModel from "@/assets/smart-home-model.png";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

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
          <div className="inline-flex items-center gap-2 mb-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Hệ thống hoạt động</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Nhà Thông Minh
          </h1>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link to="/indoor">
              <Card className="p-8 bg-gradient-to-br from-card to-muted/30 border-border shadow-card hover:shadow-card-hover hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4 group-hover:shadow-glow-primary transition-all duration-300 group-hover:animate-float">
                    <Home className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Trong Nhà</h3>
                  <p className="text-muted-foreground">Đèn, quạt, nhiệt độ, khí gas</p>
                </div>
              </Card>
            </Link>

            <Link to="/outdoor">
              <Card className="p-8 bg-gradient-to-br from-card to-muted/30 border-border shadow-card hover:shadow-card-hover hover:shadow-secondary/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 mb-4 group-hover:shadow-glow-secondary transition-all duration-300 group-hover:animate-float">
                    <TreePine className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Vườn Rau</h3>
                  <p className="text-muted-foreground">Độ ẩm đất, máy bơm nước</p>
                </div>
              </Card>
            </Link>

            <Link to="/info">
              <Card className="p-8 bg-gradient-to-br from-card to-muted/30 border-border shadow-card hover:shadow-card-hover hover:shadow-accent/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 mb-4 group-hover:shadow-glow-accent transition-all duration-300 group-hover:animate-float">
                    <Info className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Thông Tin</h3>
                  <p className="text-muted-foreground">Tổng quan hệ thống</p>
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
