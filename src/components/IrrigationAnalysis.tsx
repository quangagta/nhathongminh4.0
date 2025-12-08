import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Droplets, Sun, Clock, Zap, RefreshCw, Loader2, Lightbulb, Timer, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IrrigationResult {
  soilStatus: 'very_dry' | 'dry' | 'optimal' | 'moist' | 'wet';
  needsWatering: boolean;
  urgencyLevel: 'immediate' | 'soon' | 'none' | 'reduce';
  waterAmount: number;
  durationMinutes: number;
  optimalTime: string;
  solarOptimized: boolean;
  analysis: string;
  recommendation: string;
  nextWateringPrediction: string;
  energySavingTip: string;
  error?: string;
}

interface IrrigationAnalysisProps {
  humidity: number;
  temperature: number;
  history?: Array<{ time: string; humidity: number }>;
  onAutoWater?: (shouldWater: boolean) => void;
}

export const IrrigationAnalysis = ({ humidity, temperature, history, onAutoWater }: IrrigationAnalysisProps) => {
  const [result, setResult] = useState<IrrigationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  const analyzeIrrigation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-irrigation', {
        body: { humidity, temperature, history }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
      setLastAnalyzed(new Date());

      // Notify if urgent watering needed
      if (data.urgencyLevel === 'immediate') {
        toast.warning(`🌱 Cần tưới ngay! Độ ẩm đất: ${humidity}%`, {
          duration: 8000,
        });
        onAutoWater?.(true);
      }
    } catch (error) {
      console.error('Error analyzing irrigation:', error);
      toast.error('Không thể phân tích tưới cây');
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when humidity changes significantly
  useEffect(() => {
    const shouldAnalyze = !lastAnalyzed || 
      (Date.now() - lastAnalyzed.getTime() > 60000); // Re-analyze every minute
    
    if (shouldAnalyze && humidity > 0) {
      analyzeIrrigation();
    }
  }, [humidity]);

  const getSoilStatusColor = (status: string) => {
    switch (status) {
      case 'very_dry': return 'bg-red-500';
      case 'dry': return 'bg-orange-500';
      case 'optimal': return 'bg-green-500';
      case 'moist': return 'bg-blue-400';
      case 'wet': return 'bg-blue-600';
      default: return 'bg-muted';
    }
  };

  const getSoilStatusLabel = (status: string) => {
    switch (status) {
      case 'very_dry': return 'Rất khô';
      case 'dry': return 'Khô';
      case 'optimal': return 'Tối ưu';
      case 'moist': return 'Ẩm';
      case 'wet': return 'Quá ẩm';
      default: return 'Đang tải...';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'immediate': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'soon': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'none': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reduce': return <Droplets className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'immediate': return 'Tưới ngay';
      case 'soon': return 'Tưới sớm';
      case 'none': return 'Không cần';
      case 'reduce': return 'Giảm tưới';
      default: return '';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-green-950/20 border-green-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Droplets className="h-5 w-5 text-green-400" />
            </div>
            AI Tưới Cây Thông Minh
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeIrrigation}
            disabled={loading}
            className="border-green-500/30 hover:bg-green-500/10"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !result ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            <span className="ml-2 text-muted-foreground">Đang phân tích...</span>
          </div>
        ) : result ? (
          <>
            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Trạng thái đất</span>
                </div>
                <Badge className={`${getSoilStatusColor(result.soilStatus)} text-white`}>
                  {getSoilStatusLabel(result.soilStatus)}
                </Badge>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  {getUrgencyIcon(result.urgencyLevel)}
                  <span className="text-xs text-muted-foreground">Mức độ cần tưới</span>
                </div>
                <span className="font-medium">{getUrgencyLabel(result.urgencyLevel)}</span>
              </div>
            </div>

            {/* Watering Details */}
            {result.needsWatering && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-400" />
                    <span className="text-muted-foreground">Lượng nước:</span>
                    <span className="font-medium">{result.waterAmount} ml</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-orange-400" />
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">{result.durationMinutes} phút</span>
                  </div>
                </div>
              </div>
            )}

            {/* Optimal Time & Solar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">Thời điểm tối ưu</span>
                </div>
                <span className="text-sm font-medium">{result.optimalTime}</span>
              </div>
              
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">Năng lượng mặt trời</span>
                </div>
                <Badge variant={result.solarOptimized ? "default" : "secondary"}>
                  {result.solarOptimized ? "Tối ưu" : "Chưa tối ưu"}
                </Badge>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Phân tích AI
              </h4>
              <p className="text-sm text-muted-foreground">{result.analysis}</p>
            </div>

            {/* Recommendation */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <h4 className="text-sm font-medium mb-2">💡 Đề xuất</h4>
              <p className="text-sm">{result.recommendation}</p>
            </div>

            {/* Next Watering & Energy Tip */}
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium">Dự đoán tưới tiếp theo</span>
                </div>
                <p className="text-sm text-muted-foreground">{result.nextWateringPrediction}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-medium">Mẹo tiết kiệm năng lượng</span>
                </div>
                <p className="text-sm text-muted-foreground">{result.energySavingTip}</p>
              </div>
            </div>

            {/* Last Analyzed */}
            {lastAnalyzed && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
                Cập nhật: {lastAnalyzed.toLocaleTimeString('vi-VN')}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Nhấn nút để phân tích tưới cây
          </div>
        )}
      </CardContent>
    </Card>
  );
};
