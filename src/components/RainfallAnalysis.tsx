import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CloudRain, Sun, CloudDrizzle, Cloud, CloudLightning, RefreshCw, Wifi, WifiOff, Droplets, Umbrella, Leaf, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RainfallResult {
  rainStatus: 'none' | 'light' | 'moderate' | 'heavy' | 'very_heavy' | 'unknown';
  isRaining: boolean;
  analysis: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  trendAnalysis: string;
  agriculturalAdvice: string;
  lifestyleAdvice: string;
  forecast: string;
  waterSavingTip: string;
}

interface RainfallAnalysisProps {
  isRaining: boolean;
  rainIntensity: number;
  history?: Array<{ time: string; intensity: number; isRaining: boolean }>;
}

const CACHE_KEY = 'rainfall_analysis_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ANALYSIS_COOLDOWN = 3 * 60 * 1000; // 3 minutes

let isAnalyzing = false;

const generateFallbackAnalysis = (isRaining: boolean, intensity: number): RainfallResult => ({
  rainStatus: intensity > 80 ? "very_heavy" : intensity > 60 ? "heavy" : intensity > 40 ? "moderate" : intensity > 20 ? "light" : "none",
  isRaining,
  analysis: isRaining ? `Đang mưa với cường độ ${intensity}%` : "Hiện tại trời không mưa",
  trend: "unknown",
  trendAnalysis: "Đang phân tích xu hướng...",
  agriculturalAdvice: isRaining ? "Tạm dừng tưới tiêu" : "Có thể tưới tiêu bình thường",
  lifestyleAdvice: isRaining ? "Nên mang ô khi ra ngoài" : "Thời tiết thuận lợi",
  forecast: "Đang cập nhật dự báo...",
  waterSavingTip: isRaining ? "Tận dụng nước mưa" : "Tiết kiệm nước khi tưới cây"
});

const loadCachedResult = (): { result: RainfallResult; timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Error loading cached rainfall analysis:', e);
  }
  return null;
};

const saveCachedResult = (result: RainfallResult) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ result, timestamp: Date.now() }));
  } catch (e) {
    console.error('Error saving rainfall analysis cache:', e);
  }
};

export const RainfallAnalysis = ({ isRaining, rainIntensity, history }: RainfallAnalysisProps) => {
  const [result, setResult] = useState<RainfallResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastAnalysis, setLastAnalysis] = useState<number>(0);
  const { toast } = useToast();
  const hasAutoAnalyzed = useRef(false);

  useEffect(() => {
    const cached = loadCachedResult();
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResult(cached.result);
      setLastAnalysis(cached.timestamp);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const analyzeRainfall = useCallback(async (manual = false) => {
    if (isAnalyzing) return;
    
    const now = Date.now();
    if (!manual && now - lastAnalysis < ANALYSIS_COOLDOWN) return;

    isAnalyzing = true;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-rainfall', {
        body: { isRaining, rainIntensity, history }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit') || data.error.includes('Payment required')) {
          toast({
            title: "Giới hạn API",
            description: "Đang sử dụng phân tích offline",
            variant: "destructive"
          });
          const fallback = generateFallbackAnalysis(isRaining, rainIntensity);
          setResult(fallback);
        } else {
          throw new Error(data.error);
        }
      } else {
        setResult(data);
        saveCachedResult(data);
        setLastAnalysis(now);
      }
    } catch (e) {
      console.error('Rainfall analysis error:', e);
      const fallback = generateFallbackAnalysis(isRaining, rainIntensity);
      setResult(fallback);
      
      if (manual) {
        toast({
          title: "Lỗi phân tích",
          description: "Đang sử dụng phân tích offline",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      isAnalyzing = false;
    }
  }, [isRaining, rainIntensity, history, lastAnalysis, toast]);

  // Auto-analyze on mount or when data changes significantly
  useEffect(() => {
    if (!hasAutoAnalyzed.current && !result) {
      const delay = Math.random() * 2000 + 1000;
      const timer = setTimeout(() => {
        hasAutoAnalyzed.current = true;
        analyzeRainfall();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [analyzeRainfall, result]);

  const getRainStatusIcon = (status: string) => {
    switch (status) {
      case 'none': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'light': return <CloudDrizzle className="h-5 w-5 text-blue-400" />;
      case 'moderate': return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'heavy': return <CloudRain className="h-5 w-5 text-blue-600" />;
      case 'very_heavy': return <CloudLightning className="h-5 w-5 text-purple-600" />;
      default: return <Cloud className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRainStatusLabel = (status: string) => {
    switch (status) {
      case 'none': return 'Không mưa';
      case 'light': return 'Mưa nhỏ';
      case 'moderate': return 'Mưa vừa';
      case 'heavy': return 'Mưa to';
      case 'very_heavy': return 'Mưa rất to';
      default: return 'Không xác định';
    }
  };

  const getRainStatusColor = (status: string) => {
    switch (status) {
      case 'none': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'light': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'moderate': return 'bg-blue-200 text-blue-900 border-blue-400';
      case 'heavy': return 'bg-blue-300 text-blue-900 border-blue-500';
      case 'very_heavy': return 'bg-purple-200 text-purple-900 border-purple-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sky-800">
            <CloudRain className="h-5 w-5" />
            Phân Tích Thời Tiết AI
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => analyzeRainfall(true)}
              disabled={loading}
              className="border-sky-300 hover:bg-sky-100"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
          <div className="flex items-center gap-3">
            {result ? getRainStatusIcon(result.rainStatus) : <Cloud className="h-5 w-5 text-gray-400" />}
            <div>
              <p className="text-sm text-gray-600">Trạng thái hiện tại</p>
              {loading && !result ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <p className="font-semibold text-sky-800">
                  {result ? getRainStatusLabel(result.rainStatus) : 'Đang tải...'}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Cường độ</p>
            <p className="text-2xl font-bold text-sky-700">{rainIntensity}%</p>
          </div>
        </div>

        {/* Status Badge */}
        {result && (
          <div className="flex justify-center">
            <Badge className={`text-sm px-4 py-1 ${getRainStatusColor(result.rainStatus)}`}>
              {result.isRaining ? '🌧️ Đang mưa' : '☀️ Trời nắng'}
            </Badge>
          </div>
        )}

        {/* Analysis */}
        {loading && !result ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : result ? (
          <div className="space-y-3">
            <div className="p-3 bg-white/60 rounded-lg">
              <p className="text-sm text-gray-700">{result.analysis}</p>
            </div>

            {/* Trend */}
            <div className="p-3 bg-white/60 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span>{getTrendIcon(result.trend)}</span>
                <p className="font-medium text-sky-800">Xu hướng</p>
              </div>
              <p className="text-sm text-gray-700">{result.trendAnalysis}</p>
            </div>

            {/* Advice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <p className="font-medium text-green-800 text-sm">Nông nghiệp</p>
                </div>
                <p className="text-xs text-green-700">{result.agriculturalAdvice}</p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="h-4 w-4 text-orange-600" />
                  <p className="font-medium text-orange-800 text-sm">Sinh hoạt</p>
                </div>
                <p className="text-xs text-orange-700">{result.lifestyleAdvice}</p>
              </div>
            </div>

            {/* Forecast */}
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-2 mb-1">
                <Umbrella className="h-4 w-4 text-indigo-600" />
                <p className="font-medium text-indigo-800 text-sm">Dự báo</p>
              </div>
              <p className="text-xs text-indigo-700">{result.forecast}</p>
            </div>

            {/* Water Saving Tip */}
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="h-4 w-4 text-cyan-600" />
                <p className="font-medium text-cyan-800 text-sm">Mẹo tiết kiệm nước</p>
              </div>
              <p className="text-xs text-cyan-700">{result.waterSavingTip}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
