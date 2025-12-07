import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { Thermometer, Flame, Droplets, TrendingUp } from "lucide-react";

export const SensorChart = () => {
  const { history, currentData, loading, settings } = useSensorHistory();

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

      {/* Chart */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Biểu đồ thời gian thực</h3>
        </div>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                name="Nhiệt độ (°C)"
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="gasLevel" 
                name="Khí gas (ppm)"
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                name="Độ ẩm (%)"
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Dữ liệu cập nhật theo thời gian thực từ Firebase
        </p>
      </Card>
    </div>
  );
};
