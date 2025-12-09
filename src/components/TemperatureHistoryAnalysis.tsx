import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Thermometer, TrendingUp, TrendingDown, Activity, RefreshCw, Database } from 'lucide-react';
import { useTemperatureHistoryData } from '@/hooks/useTemperatureHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

export const TemperatureHistoryAnalysis = () => {
  const { getStats } = useTemperatureHistoryData();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  const loadStats = async () => {
    setLoading(true);
    const data = await getStats(selectedDays);
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [selectedDays]);

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

    // Temperature analysis
    if (temperature.avg > 30) {
      analyses.push('🌡️ Nhiệt độ trung bình cao, cần tăng cường thông gió hoặc làm mát.');
    } else if (temperature.avg < 20) {
      analyses.push('❄️ Nhiệt độ trung bình thấp, có thể cần sưởi ấm.');
    } else {
      analyses.push('✅ Nhiệt độ trung bình trong khoảng tối ưu (20-30°C).');
    }

    if (tempRange > 15) {
      analyses.push('⚠️ Biên độ nhiệt trong tuần cao (' + tempRange.toFixed(1) + '°C), cần ổn định nhiệt độ.');
    }

    // Humidity analysis
    if (humidity) {
      if (humidity.avg > 80) {
        analyses.push('💧 Độ ẩm cao, cần hút ẩm hoặc tăng thông gió.');
      } else if (humidity.avg < 40) {
        analyses.push('🏜️ Độ ẩm thấp, có thể cần phun sương hoặc tưới nước.');
      }
    }

    // Gas level analysis
    if (gasLevel && gasLevel.max > 50) {
      analyses.push('⛽ Có ghi nhận mức khí gas cao trong tuần, kiểm tra nguồn rò rỉ.');
    }

    return analyses;
  };

  const chartData = stats?.history.map(h => ({
    time: new Date(h.recorded_at).toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    temperature: Number(h.temperature),
    humidity: h.humidity ? Number(h.humidity) : null,
  })) || [];

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
          <span className="ml-2">Đang tải dữ liệu...</span>
        </CardContent>
      </Card>
    );
  }

  const status = stats ? getTemperatureStatus(stats.temperature.avg) : null;
  const StatusIcon = status?.icon || Activity;
  const analyses = getAnalysis();

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Database className="h-5 w-5" />
            Phân tích lịch sử nhiệt độ
          </CardTitle>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={loadStats}
              className="text-orange-600"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stats || stats.totalRecords === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có dữ liệu lịch sử</p>
            <p className="text-sm">Dữ liệu sẽ được lưu tự động mỗi 5 phút</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Nhiệt độ TB</span>
                </div>
                <div className="text-xl font-bold text-red-600">
                  {stats.temperature.avg.toFixed(1)}°C
                </div>
                <Badge className={`${status?.color} text-white text-xs mt-1`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status?.label}
                </Badge>
              </div>

              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Thấp nhất</span>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {stats.temperature.min.toFixed(1)}°C
                </div>
              </div>

              <div className="bg-white/70 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Cao nhất</span>
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {stats.temperature.max.toFixed(1)}°C
                </div>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 1 && (
              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                      name="Nhiệt độ (°C)"
                    />
                    {chartData.some(d => d.humidity !== null) && (
                      <Line 
                        type="monotone" 
                        dataKey="humidity" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                        name="Độ ẩm (%)"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Analysis */}
            {analyses && analyses.length > 0 && (
              <div className="bg-white/70 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2 text-orange-700">
                  📊 Đánh giá & Khuyến nghị
                </h4>
                <ul className="space-y-1 text-sm">
                  {analyses.map((analysis, idx) => (
                    <li key={idx}>{analysis}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center">
              Tổng số bản ghi: {stats.totalRecords} | Lưu tự động mỗi 5 phút
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
