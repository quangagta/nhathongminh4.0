import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { useTemperatureHistoryData } from "@/hooks/useTemperatureHistory";
import { Thermometer, Flame, Droplets, TrendingUp, TrendingDown, Activity, RefreshCw, Database, Clock } from "lucide-react";

interface Stats {
  temperature: { min: number; max: number; avg: number };
  humidity: { min: number; max: number; avg: number } | null;
  gasLevel: { min: number; max: number; avg: number } | null;
  totalRecords: number;
  history: Array<{
    id: string;
    temperature: number;
    humidity: number | null;
    gas_level: number | null;
    recorded_at: string;
  }>;
}

export const SensorChart = () => {
  const { history, currentData, loading, settings } = useSensorHistory();
  const { getStats } = useTemperatureHistoryData();
  const [stats, setStats] = useState<Stats | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  const loadStats = async () => {
    setHistoryLoading(true);
    const data = await getStats(selectedDays);
    setStats(data);
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [selectedDays]);

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  const isGasAlert = currentData.gasLevel > settings.gasThreshold;
  const isTempAlert = currentData.temperature > settings.tempThreshold;

  const getTemperatureStatus = (avg: number) => {
    if (avg < 20) return { label: 'Lạnh', color: 'bg-blue-500', icon: TrendingDown };
    if (avg <= 28) return { label: 'Tối ưu', color: 'bg-green-500', icon: Activity };
    if (avg <= 35) return { label: 'Nóng', color: 'bg-orange-500', icon: TrendingUp };
    return { label: 'Rất nóng', color: 'bg-red-500', icon: TrendingUp };
  };

  const getAnalysis = () => {
    if (!stats) return null;

    const { temperature, humidity, gasLevel } = stats;
    const tempRange = temperature.max - temperature.min;
    const analyses: string[] = [];

    if (temperature.avg > 30) {
      analyses.push('🌡️ Nhiệt độ TB cao, cần tăng cường thông gió.');
    } else if (temperature.avg < 20) {
      analyses.push('❄️ Nhiệt độ TB thấp, có thể cần sưởi ấm.');
    } else {
      analyses.push('✅ Nhiệt độ TB trong khoảng tối ưu.');
    }

    if (tempRange > 15) {
      analyses.push('⚠️ Biên độ nhiệt cao (' + tempRange.toFixed(1) + '°C).');
    }

    if (humidity && humidity.avg > 80) {
      analyses.push('💧 Độ ẩm cao, cần hút ẩm.');
    }

    if (gasLevel && gasLevel.max > 50) {
      analyses.push('⛽ Có mức khí gas cao, kiểm tra rò rỉ.');
    }

    return analyses;
  };

  const historyChartData = stats?.history.map(h => ({
    time: new Date(h.recorded_at).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    temperature: Number(h.temperature),
    humidity: h.humidity ? Number(h.humidity) : null,
    gasLevel: h.gas_level ? Number(h.gas_level) : null,
  })) || [];

  const status = stats ? getTemperatureStatus(stats.temperature.avg) : null;
  const StatusIcon = status?.icon || Activity;
  const analyses = getAnalysis();

  return (
    <div className="space-y-6">
      {/* Current Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`p-4 bg-card border-border transition-all ${isTempAlert ? 'border-destructive shadow-lg shadow-destructive/20 animate-pulse' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isTempAlert ? 'bg-destructive/20' : 'bg-orange-500/10'}`}>
              <Thermometer className={`w-6 h-6 ${isTempAlert ? 'text-destructive' : 'text-orange-500'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nhiệt độ</p>
              <p className={`text-2xl font-bold ${isTempAlert ? 'text-destructive' : ''}`}>
                {currentData.temperature}°C
              </p>
              {isTempAlert && (
                <p className="text-xs text-destructive">Vượt ngưỡng {settings.tempThreshold}°C!</p>
              )}
            </div>
          </div>
        </Card>

        <Card className={`p-4 bg-card border-border transition-all ${isGasAlert ? 'border-destructive shadow-lg shadow-destructive/20 animate-pulse' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isGasAlert ? 'bg-destructive/20' : 'bg-red-500/10'}`}>
              <Flame className={`w-6 h-6 ${isGasAlert ? 'text-destructive' : 'text-red-500'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Khí Gas</p>
              <p className={`text-2xl font-bold ${isGasAlert ? 'text-destructive' : ''}`}>
                {currentData.gasLevel} ppm
              </p>
              {isGasAlert && (
                <p className="text-xs text-destructive">Vượt ngưỡng {settings.gasThreshold} ppm!</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Độ ẩm</p>
              <p className="text-2xl font-bold">{currentData.humidity}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Combined Chart with Tabs */}
      <Card className="p-6 bg-card border-border">
        <Tabs defaultValue="realtime" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="realtime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Thời gian thực
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Lịch sử tuần
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Realtime Tab */}
          <TabsContent value="realtime" className="mt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" name="Nhiệt độ (°C)" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gasLevel" name="Khí gas (ppm)" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Dữ liệu cập nhật theo thời gian thực từ Firebase
            </p>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                {[1, 3, 7].map(days => (
                  <Button
                    key={days}
                    variant={selectedDays === days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDays(days)}
                    className="text-xs"
                  >
                    {days} ngày
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={loadStats}>
                <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {historyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !stats || stats.totalRecords === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <Database className="h-12 w-12 mb-2 opacity-50" />
                <p>Chưa có dữ liệu lịch sử</p>
                <p className="text-sm">Lưu tự động mỗi 5 phút</p>
              </div>
            ) : (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-muted-foreground">TB</div>
                    <div className="text-lg font-bold text-orange-500">{stats.temperature.avg.toFixed(1)}°C</div>
                    <Badge className={`${status?.color} text-white text-xs mt-1`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status?.label}
                    </Badge>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-muted-foreground">Thấp nhất</div>
                    <div className="text-lg font-bold text-blue-500">{stats.temperature.min.toFixed(1)}°C</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-muted-foreground">Cao nhất</div>
                    <div className="text-lg font-bold text-red-500">{stats.temperature.max.toFixed(1)}°C</div>
                  </div>
                </div>

                {/* History Chart */}
                {historyChartData.length > 1 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={false} name="Nhiệt độ" />
                        <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Độ ẩm" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Analysis */}
                {analyses && analyses.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 mt-3">
                    <h4 className="font-semibold text-xs mb-1">📊 Đánh giá</h4>
                    <ul className="text-xs space-y-0.5">
                      {analyses.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {stats.totalRecords} bản ghi | Lưu tự động mỗi 5 phút
                </p>
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
