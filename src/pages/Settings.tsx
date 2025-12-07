import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAlertSettings } from "@/hooks/useAlertSettings";
import { useToast } from "@/hooks/use-toast";
import { Flame, Thermometer, Volume2, RotateCcw } from "lucide-react";

const Settings = () => {
  const { settings, updateSettings, resetSettings } = useAlertSettings();
  const { toast } = useToast();

  const handleReset = () => {
    resetSettings();
    toast({
      title: "Đã đặt lại",
      description: "Các cài đặt đã được khôi phục về mặc định",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Cài Đặt"
          description="Tùy chỉnh ngưỡng cảnh báo"
          gradient="from-primary to-accent"
        />

        <div className="space-y-6">
          {/* Gas Threshold */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Flame className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ngưỡng Khí Gas</CardTitle>
                  <CardDescription>
                    Cảnh báo khi nồng độ gas vượt quá ngưỡng này
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Ngưỡng hiện tại</Label>
                <span className="text-2xl font-bold text-red-400">
                  {settings.gasThreshold} <span className="text-sm font-normal text-muted-foreground">ppm</span>
                </span>
              </div>
              <Slider
                value={[settings.gasThreshold]}
                onValueChange={(value) => updateSettings({ gasThreshold: value[0] })}
                min={10}
                max={100}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 ppm</span>
                <span>100 ppm</span>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Threshold */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Thermometer className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ngưỡng Nhiệt Độ</CardTitle>
                  <CardDescription>
                    Cảnh báo khi nhiệt độ vượt quá ngưỡng này
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Ngưỡng hiện tại</Label>
                <span className="text-2xl font-bold text-orange-400">
                  {settings.tempThreshold} <span className="text-sm font-normal text-muted-foreground">°C</span>
                </span>
              </div>
              <Slider
                value={[settings.tempThreshold]}
                onValueChange={(value) => updateSettings({ tempThreshold: value[0] })}
                min={25}
                max={50}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>25°C</span>
                <span>50°C</span>
              </div>
            </CardContent>
          </Card>

          {/* Sound Settings */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Volume2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Âm Thanh Cảnh Báo</CardTitle>
                  <CardDescription>
                    Bật/tắt âm thanh khi có cảnh báo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-toggle">Phát âm thanh cảnh báo</Label>
                <Switch
                  id="sound-toggle"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Khôi phục cài đặt mặc định
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
