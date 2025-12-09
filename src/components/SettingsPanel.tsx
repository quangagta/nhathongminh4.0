import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAlertSettings } from "@/hooks/useAlertSettings";
import { Flame, Thermometer, Volume2, Settings, Mail, Clock, Play, Square, Check } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";

export const SettingsPanel = () => {
  const { settings, updateSettings } = useAlertSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const playTestSound = () => {
    if (isPlaying) {
      // Stop sound
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 700;
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      
      // Add wobble effect
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5;
      lfoGain.gain.value = 0.1;
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      
      oscillatorRef.current = oscillator;
      lfoRef.current = lfo;
      
      oscillator.start();
      lfo.start();
      setIsPlaying(true);
      
      // Auto stop after duration
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current = null;
        }
        if (lfoRef.current) {
          lfoRef.current.stop();
          lfoRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        setIsPlaying(false);
      }, settings.soundDuration * 1000);
    } catch (error) {
      console.error('Error playing test sound:', error);
      setIsPlaying(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Settings className="h-5 w-5 text-blue-400" />
          </div>
          <CardTitle className="text-xl">Cài Đặt Cảnh Báo</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gas Threshold */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-400" />
            <Label className="text-sm font-medium">Ngưỡng Khí Gas</Label>
            <span className="ml-auto text-lg font-bold text-red-400">
              {settings.gasThreshold} <span className="text-xs font-normal text-muted-foreground">ppm</span>
            </span>
          </div>
          <Slider
            value={[settings.gasThreshold]}
            onValueChange={(value) => updateSettings({ gasThreshold: value[0] })}
            min={10}
            max={100}
            step={5}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10 ppm</span>
            <span>100 ppm</span>
          </div>
        </div>

        {/* Temperature Threshold */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-400" />
            <Label className="text-sm font-medium">Ngưỡng Nhiệt Độ</Label>
            <span className="ml-auto text-lg font-bold text-orange-400">
              {settings.tempThreshold} <span className="text-xs font-normal text-muted-foreground">°C</span>
            </span>
          </div>
          <Slider
            value={[settings.tempThreshold]}
            onValueChange={(value) => updateSettings({ tempThreshold: value[0] })}
            min={25}
            max={50}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>25°C</span>
            <span>50°C</span>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-blue-400" />
              <Label htmlFor="sound-toggle" className="text-sm font-medium">Âm thanh cảnh báo</Label>
            </div>
            <Switch
              id="sound-toggle"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
          </div>
          
          {settings.soundEnabled && (
            <div className="space-y-3 pl-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <Label className="text-sm font-medium">Thời gian âm thanh</Label>
                <span className="ml-auto text-lg font-bold text-purple-400">
                  {settings.soundDuration} <span className="text-xs font-normal text-muted-foreground">giây</span>
                </span>
              </div>
              <Slider
                value={[settings.soundDuration]}
                onValueChange={(value) => updateSettings({ soundDuration: value[0] })}
                min={1}
                max={10}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 giây</span>
                <span>10 giây</span>
              </div>
              
              {/* Test Sound Button */}
              <Button
                variant={isPlaying ? "destructive" : "outline"}
                size="sm"
                onClick={playTestSound}
                className="w-full mt-2"
              >
                {isPlaying ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Dừng ({settings.soundDuration}s)
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test âm thanh ({settings.soundDuration}s)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Email Alert Toggle */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-400" />
              <Label htmlFor="email-toggle" className="text-sm font-medium">Gửi email cảnh báo</Label>
            </div>
            <Switch
              id="email-toggle"
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => updateSettings({ emailEnabled: checked })}
            />
          </div>
          
          {settings.emailEnabled && (
            <div className="space-y-2">
              <Label htmlFor="alert-email" className="text-xs text-muted-foreground">
                Email nhận cảnh báo
              </Label>
              <Input
                id="alert-email"
                type="email"
                placeholder="example@gmail.com"
                value={settings.alertEmail}
                onChange={(e) => updateSettings({ alertEmail: e.target.value })}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Khi gas hoặc nhiệt độ vượt ngưỡng, hệ thống sẽ gửi email cảnh báo đến địa chỉ này.
              </p>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <div className="pt-4 border-t border-border/50">
          <Button
            onClick={() => {
              toast.success("Đã lưu cài đặt cảnh báo!", {
                description: `Gas: ${settings.gasThreshold}ppm | Nhiệt độ: ${settings.tempThreshold}°C | Âm thanh: ${settings.soundEnabled ? settings.soundDuration + 's' : 'Tắt'}`,
              });
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Xác nhận cài đặt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
