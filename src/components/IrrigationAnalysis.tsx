import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Sun, Clock, Zap, RefreshCw, Loader2, Lightbulb, Timer, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
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

const CACHE_KEY = 'irrigation_analysis_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;

// Generate fallback analysis when API is unavailable
const generateFallbackAnalysis = (humidity: number, temperature: number): IrrigationResult => {
  const currentHour = new Date().getHours();
  
  let soilStatus: IrrigationResult['soilStatus'];
  let needsWatering = false;
  let urgencyLevel: IrrigationResult['urgencyLevel'] = 'none';
  let waterAmount = 0;
  let durationMinutes = 0;
  
  if (humidity < 30) {
    soilStatus = 'very_dry';
    needsWatering = true;
    urgencyLevel = 'immediate';
    waterAmount = 500;
    durationMinutes = 10;
  } else if (humidity < 45) {
    soilStatus = 'dry';
    needsWatering = true;
    urgencyLevel = 'soon';
    waterAmount = 300;
    durationMinutes = 5;
  } else if (humidity < 60) {
    soilStatus = 'optimal';
    urgencyLevel = 'none';
  } else if (humidity < 75) {
    soilStatus = 'moist';
    urgencyLevel = 'reduce';
  } else {
    soilStatus = 'wet';
    urgencyLevel = 'reduce';
  }

  const optimalTime = currentHour >= 5 && currentHour < 11 
    ? "Ngay bây giờ (buổi sáng)" 
    : currentHour >= 16 && currentHour < 18 
    ? "Ngay bây giờ (chiều mát)"
    : "9:00 - 11:00 sáng";

  return {
    soilStatus,
    needsWatering,
    urgencyLevel,
    waterAmount,
    durationMinutes,
    optimalTime,
    solarOptimized: currentHour >= 9 && currentHour <= 16,
    analysis: `[Offline] Độ ẩm đất ${humidity}%, nhiệt độ ${temperature}°C. ${
      humidity < 45 ? 'Đất đang khô, cần tưới nước.' : 
      humidity > 75 ? 'Đất quá ẩm, không nên tưới thêm.' : 
      'Độ ẩm ở mức phù hợp cho cây trồng.'
    }`,
    recommendation: needsWatering 
      ? `Nên tưới ${waterAmount}ml nước trong ${durationMinutes} phút.`
      : 'Chưa cần tưới, tiếp tục theo dõi.',
    nextWateringPrediction: humidity < 45 
      ? 'Cần tưới trong vòng 1-2 giờ' 
      : humidity < 60 
      ? 'Có thể cần tưới trong 4-6 giờ'
      : 'Dự kiến cần tưới vào ngày mai',
    energySavingTip: 'Tưới vào buổi sáng 9h-11h khi pin mặt trời đầy năng lượng và nhiệt độ chưa quá cao.'
  };
};

// Load cached result
const loadCachedResult = (): { result: IrrigationResult; timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Error loading cached irrigation result:', e);
  }
  return null;
};

// Save result to cache
const saveCachedResult = (result: IrrigationResult) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      result,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Error saving irrigation result to cache:', e);
  }
};

export const IrrigationAnalysis = ({ humidity, temperature, history, onAutoWater }: IrrigationAnalysisProps) => {
  const [result, setResult] = useState<IrrigationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Load cached result on mount
  useEffect(() => {
    const cached = loadCachedResult();
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResult(cached.result);
      setLastAnalyzed(new Date(cached.timestamp));
    }
  }, []);

  const analyzeIrrigation = useCallback(async (retry = 0) => {
    setLoading(true);
    setRetryCount(retry);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-irrigation', {
        body: { humidity, temperature, history }
      });

      if (error) {
        // Check for rate limit or payment errors
        if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
          if (retry < MAX_RETRIES) {
            const delay = Math.pow(2, retry) * 1000;
            console.log(`Rate limited, retrying in ${delay}ms (attempt ${retry + 1}/${MAX_RETRIES})`);
            await new Promise(r => setTimeout(r, delay));
            return analyzeIrrigation(retry + 1);
          }
          setIsOnline(false);
          const fallback = generateFallbackAnalysis(humidity, temperature);
          setResult(fallback);
          toast.info('Đang sử dụng phân tích offline do giới hạn API');
          return;
        }
        throw error;
      }
      
      if (data.error) {
        if (data.error.includes('Rate limit') || data.error.includes('429')) {
          if (retry < MAX_RETRIES) {
            const delay = Math.pow(2, retry) * 1000;
            await new Promise(r => setTimeout(r, delay));
            return analyzeIrrigation(retry + 1);
          }
          setIsOnline(false);
          const fallback = generateFallbackAnalysis(humidity, temperature);
          setResult(fallback);
          saveCachedResult(fallback);
          toast.info('Đang sử dụng phân tích offline');
          return;
        }
        toast.error(data.error);
        return;
      }

      setIsOnline(true);
      setResult(data);
      setLastAnalyzed(new Date());
      saveCachedResult(data);

      // Notify if urgent watering needed
      if (data.urgencyLevel === 'immediate') {
        toast.warning(`🌱 Cần tưới ngay! Độ ẩm đất: ${humidity}%`, {
          duration: 8000,
        });
        onAutoWater?.(true);
      }
    } catch (error) {
      console.error('Error analyzing irrigation:', error);
      setIsOnline(false);
      
      // Use cached or fallback
      const cached = loadCachedResult();
      if (cached) {
        setResult(cached.result);
        toast.info('Đang sử dụng phân tích đã lưu');
      } else {
        const fallback = generateFallbackAnalysis(humidity, temperature);
        setResult(fallback);
        toast.info('Đang sử dụng phân tích offline');
      }
    } finally {
      setLoading(false);
      setRetryCount(0);
    }
  }, [humidity, temperature, history, onAutoWater]);

  // Auto-analyze when humidity changes significantly
  useEffect(() => {
    const shouldAnalyze = !lastAnalyzed || 
      (Date.now() - lastAnalyzed.getTime() > 120000); // Re-analyze every 2 minutes
    
    if (shouldAnalyze && humidity > 0) {
      analyzeIrrigation();
    }
  }, [humidity, analyzeIrrigation]);

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
          <div className="flex items-center gap-2">
            {/* Online/Offline Status Indicator */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
              isOnline 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>AI Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => analyzeIrrigation()}
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !result ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            <span className="ml-2 text-muted-foreground mt-2">
              {retryCount > 0 ? `Đang thử lại... (${retryCount}/${MAX_RETRIES})` : 'Đang phân tích...'}
            </span>
          </div>
        ) : result ? (
          <>
            {/* Offline Warning */}
            {!isOnline && (
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2 text-sm text-yellow-400">
                <WifiOff className="h-4 w-4" />
                <span>Đang dùng phân tích offline - Kết quả có thể không chính xác hoàn toàn</span>
              </div>
            )}

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
                Phân tích {isOnline ? 'AI' : 'Offline'}
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
                Cập nhật: {lastAnalyzed.toLocaleTimeString('vi-VN')} {!isOnline && '(Offline)'}
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
