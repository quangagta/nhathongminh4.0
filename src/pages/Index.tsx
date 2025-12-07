import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Home, TreePine, Info, Activity, Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--secondary)/0.1),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Hệ thống hoạt động</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Nhà Thông Minh
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Điều khiển và giám sát thiết bị Arduino của bạn mọi lúc, mọi nơi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/indoor">
              <Card className="p-8 bg-card border-border hover:shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 cursor-pointer group">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-all">
                    <Home className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Trong Nhà</h3>
                  <p className="text-muted-foreground">Đèn, quạt, nhiệt độ, khí gas</p>
                </div>
              </Card>
            </Link>

            <Link to="/outdoor">
              <Card className="p-8 bg-card border-border hover:shadow-xl hover:shadow-secondary/20 transition-all hover:scale-105 cursor-pointer group">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-secondary/10 mb-4 group-hover:bg-secondary/20 transition-all">
                    <TreePine className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Vườn Rau</h3>
                  <p className="text-muted-foreground">Độ ẩm đất, máy bơm nước</p>
                </div>
              </Card>
            </Link>

            <Link to="/info">
              <Card className="p-8 bg-card border-border hover:shadow-xl hover:shadow-accent/20 transition-all hover:scale-105 cursor-pointer group">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-accent/10 mb-4 group-hover:bg-accent/20 transition-all">
                    <Info className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Thông Tin</h3>
                  <p className="text-muted-foreground">Tổng quan hệ thống</p>
                </div>
              </Card>
            </Link>

            <Link to="/settings">
              <Card className="p-8 bg-card border-border hover:shadow-xl hover:shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer group md:col-span-3">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-blue-500/10 mb-4 group-hover:bg-blue-500/20 transition-all">
                    <Settings className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Cài Đặt</h3>
                  <p className="text-muted-foreground">Tùy chỉnh ngưỡng cảnh báo</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
