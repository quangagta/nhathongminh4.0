import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Droplets, History, TrendingDown, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, Loader2, RefreshCw, Bell, Minus,
  Zap, Sun, Thermometer
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';

interface HistoryPoint {
  time: string;
  humidity: number;
  temperature?: number;
  timestamp: number;
}

interface AlertItem {
  id: string;
  type: 'dry' | 'wet' | 'abnormal' | 'prediction';
  level: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: Date;
  humidity: number;
}

interface SoilMoistureHistoryProps {
  currentHumidity: number;
  currentTemperature: number;
  history: Array<{ time: string; humidity: number; temperature?: number }>;
  onWaterNow?: () => void;
}

export const SoilMoistureHistory = ({ 
  currentHumidity, 
  currentTemperature, 
  history,
  onWaterNow 
}: SoilMoistureHistoryProps) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [dryingRate, setDryingRate] = useState<number>(0);
  const [predictedDryTime, setPredictedDryTime] = useState<string>('');
  const [lastAlertTime, setLastAlertTime] = useState<Record<string, number>>({});

  // Calculate trend and drying rate
  useEffect(() => {
    if (history.length < 3) return;

    const recent = history.slice(-5);
    const first = recent[0].humidity;
    const last = recent[recent.length - 1].humidity;
    const diff = last - first;

    if (diff > 2) {
      setTrend('up');
    } else if (diff < -2) {
      setTrend('down');
    } else {
      setTrend('stable');
    }

    // Calculate drying rate (% per hour)
    if (history.length >= 2) {
      const oldestIdx = Math.max(0, history.length - 10);
      const oldPoint = history[oldestIdx];
      const newPoint = history[history.length - 1];
      
      // Assume each point is ~1 minute apart
      const timeDiffMinutes = history.length - oldestIdx;
      const humidityDiff = oldPoint.humidity - newPoint.humidity;
      
      if (timeDiffMinutes > 0) {
        const ratePerHour = (humidityDiff / timeDiffMinutes) * 60;
        setDryingRate(Math.max(0, ratePerHour));

        // Predict when soil will be dry (< 30%)
        if (ratePerHour > 0 && currentHumidity > 30) {
          const hoursUntilDry = (currentHumidity - 30) / ratePerHour;
          if (hoursUntilDry < 24) {
            setPredictedDryTime(`~${hoursUntilDry.toFixed(1)} giờ`);
          } else {
            setPredictedDryTime('> 24 giờ');
          }
        } else {
          setPredictedDryTime('Không xác định');
        }
      }
    }
  }, [history, currentHumidity]);

  // Smart alert system
  const addAlert = useCallback((alert: Omit<AlertItem, 'id' | 'timestamp'>) => {
    const now = Date.now();
    const alertKey = `${alert.type}-${alert.level}`;
    
    // Cooldown: don't repeat same alert within 2 minutes
    if (lastAlertTime[alertKey] && now - lastAlertTime[alertKey] < 120000) {
      return;
    }

    const newAlert: AlertItem = {
      ...alert,
      id: `${now}-${Math.random()}`,
      timestamp: new Date(),
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 20));
    setLastAlertTime(prev => ({ ...prev, [alertKey]: now }));

    // Show toast for important alerts
    if (alert.level === 'danger') {
      toast.error(alert.message, {
        duration: 10000,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } else if (alert.level === 'warning') {
      toast.warning(alert.message, {
        duration: 8000,
      });
    }
  }, [lastAlertTime]);

  // Check for alerts
  useEffect(() => {
    if (currentHumidity <= 0) return;

    // Alert: Đất quá khô
    if (currentHumidity < 25) {
      addAlert({
        type: 'dry',
        level: 'danger',
        message: `🚨 Đất cực kỳ khô (${currentHumidity}%)! Cây cần tưới NGAY lập tức!`,
        humidity: currentHumidity,
      });
    } else if (currentHumidity < 35) {
      addAlert({
        type: 'dry',
        level: 'warning',
        message: `⚠️ Độ ẩm thấp (${currentHumidity}%). Nên tưới sớm để cây phát triển tốt.`,
        humidity: currentHumidity,
      });
    }

    // Alert: Quá ẩm (úng)
    if (currentHumidity > 85) {
      addAlert({
        type: 'wet',
        level: 'danger',
        message: `💧 Đất quá ẩm (${currentHumidity}%)! Nguy cơ úng nước, thối rễ. Dừng tưới!`,
        humidity: currentHumidity,
      });
    } else if (currentHumidity > 75) {
      addAlert({
        type: 'wet',
        level: 'warning',
        message: `💧 Độ ẩm cao (${currentHumidity}%). Tạm thời không cần tưới thêm.`,
        humidity: currentHumidity,
      });
    }

    // Alert: Bất thường - khô quá nhanh
    if (dryingRate > 5) {
      addAlert({
        type: 'abnormal',
        level: 'warning',
        message: `⚡ Đất khô nhanh bất thường (${dryingRate.toFixed(1)}%/giờ)! Có thể do nắng gắt hoặc bơm lỗi.`,
        humidity: currentHumidity,
      });
    }

    // Alert: Dự đoán sắp khô
    if (trend === 'down' && currentHumidity > 35 && currentHumidity < 50 && dryingRate > 2) {
      const hoursUntilDry = (currentHumidity - 30) / dryingRate;
      if (hoursUntilDry < 3) {
        addAlert({
          type: 'prediction',
          level: 'info',
          message: `🔮 Dự đoán: Đất sẽ khô trong ${hoursUntilDry.toFixed(1)} giờ. Đề xuất tưới sớm!`,
          humidity: currentHumidity,
        });
      }
    }
  }, [currentHumidity, dryingRate, trend, addAlert]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-orange-400" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'up': return 'Đang tăng';
      case 'down': return 'Đang giảm';
      default: return 'Ổn định';
    }
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'dry': return <Droplets className="h-4 w-4" />;
      case 'wet': return <Droplets className="h-4 w-4" />;
      case 'abnormal': return <AlertTriangle className="h-4 w-4" />;
      case 'prediction': return <Zap className="h-4 w-4" />;
    }
  };

  const getAlertColor = (level: AlertItem['level']) => {
    switch (level) {
      case 'danger': return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'warning': return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'info': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    }
  };

  // Prepare chart data
  const chartData = history.slice(-20).map((point, idx) => ({
    ...point,
    index: idx,
  }));

  return (
    <div className="space-y-4">
      {/* Historical Chart */}
      <Card className="bg-gradient-to-br from-card to-blue-950/20 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <History className="h-5 w-5 text-blue-400" />
            </div>
            Lịch Sử Độ Ẩm Đất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af" 
                  fontSize={10}
                  tickMargin={5}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Độ ẩm']}
                />
                <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Khô', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={75} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Ướt', fill: '#3b82f6', fontSize: 10 }} />
                <Area 
                  type="monotone" 
                  dataKey="humidity" 
                  fill="url(#humidityGradient)" 
                  stroke="none"
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              {getTrendIcon()}
              <span className="text-xs text-muted-foreground">Xu hướng</span>
            </div>
            <p className="font-medium text-sm">{getTrendLabel()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-muted-foreground">Tốc độ khô</span>
            </div>
            <p className="font-medium text-sm">{dryingRate.toFixed(1)}%/giờ</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Dự đoán khô</span>
            </div>
            <p className="font-medium text-sm">{predictedDryTime}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="h-4 w-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Nhiệt độ</span>
            </div>
            <p className="font-medium text-sm">{currentTemperature}°C</p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Alerts */}
      <Card className="bg-gradient-to-br from-card to-amber-950/20 border-amber-500/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Bell className="h-5 w-5 text-amber-400" />
              </div>
              Cảnh Báo Thông Minh
              {alerts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
            {currentHumidity < 35 && onWaterNow && (
              <Button 
                size="sm" 
                onClick={onWaterNow}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Droplets className="h-4 w-4 mr-1" />
                Tưới ngay
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-center justify-center text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Mọi thứ bình thường. Không có cảnh báo.</span>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getAlertColor(alert.level)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {alert.timestamp.toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
