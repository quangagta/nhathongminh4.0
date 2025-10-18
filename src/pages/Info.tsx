import { Card } from "@/components/ui/card";
import { Home, Wifi, Activity, Clock } from "lucide-react";

const Info = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Thông Tin Chung
        </h1>
        <p className="text-muted-foreground mb-8">Tổng quan hệ thống nhà thông minh</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Địa Chỉ</h3>
            </div>
            <p className="text-muted-foreground">123 Đường ABC, Quận XYZ, TP.HCM</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Wifi className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Kết Nối</h3>
            </div>
            <p className="text-muted-foreground">Arduino ESP32 - WiFi 2.4GHz</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-sm text-secondary">Đang hoạt động</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Trạng Thái Hệ Thống</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thiết bị trong nhà:</span>
                <span className="font-semibold text-foreground">4/4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thiết bị ngoài trời:</span>
                <span className="font-semibold text-foreground">2/2</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Uptime</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">72 giờ</p>
            <p className="text-sm text-muted-foreground mt-1">Hoạt động liên tục</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Info;
