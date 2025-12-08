import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Flame, AlertTriangle, Shield, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FireRiskResult {
  riskLevel: "safe" | "warning" | "danger" | "critical";
  riskScore: number;
  smokeType: string;
  analysis: string;
  recommendation: string;
  factors: string[];
  error?: string;
}

interface FireRiskAnalysisProps {
  temperature: number;
  gasLevel: number;
  humidity: number;
  history?: Array<{ temperature: number; gasLevel: number; humidity: number }>;
}

export const FireRiskAnalysis = ({ temperature, gasLevel, humidity, history = [] }: FireRiskAnalysisProps) => {
  const [result, setResult] = useState<FireRiskResult | null>(() => {
    // Load cached result from localStorage
    const cached = localStorage.getItem('fireRiskResult');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(() => {
    const cached = localStorage.getItem('fireRiskLastAnalyzed');
    return cached ? new Date(cached) : null;
  });
  const [retryCount, setRetryCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { toast } = useToast();

  const analyzeRisk = async (retry = 0): Promise<void> => {
    setLoading(true);
    setIsRateLimited(false);
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-fire-risk", {
        body: { temperature, gasLevel, humidity, history }
      });

      if (error) {
        // Check if rate limited
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          setIsRateLimited(true);
          
          // Retry with exponential backoff (max 3 retries)
          if (retry < 3) {
            const delay = Math.pow(2, retry) * 2000; // 2s, 4s, 8s
            setRetryCount(retry + 1);
            toast({
              title: "Đang thử lại...",
              description: `Rate limit. Thử lại sau ${delay / 1000}s (${retry + 1}/3)`,
            });
            
            setTimeout(() => analyzeRisk(retry + 1), delay);
            return;
          }
          
          // Use fallback analysis after max retries
          const fallbackResult = generateFallbackAnalysis(temperature, gasLevel, humidity);
          setResult(fallbackResult);
          localStorage.setItem('fireRiskResult', JSON.stringify(fallbackResult));
          setLastAnalyzed(new Date());
          localStorage.setItem('fireRiskLastAnalyzed', new Date().toISOString());
          
          toast({
            title: "Sử dụng phân tích offline",
            description: "API bận, đang dùng phân tích cục bộ.",
          });
          return;
        }
        throw error;
      }

      setResult(data);
      localStorage.setItem('fireRiskResult', JSON.stringify(data));
      setLastAnalyzed(new Date());
      localStorage.setItem('fireRiskLastAnalyzed', new Date().toISOString());
      setRetryCount(0);
      
      if (data.riskLevel === "danger" || data.riskLevel === "critical") {
        toast({
          title: "⚠️ Cảnh báo nguy cơ cháy!",
          description: data.recommendation,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error analyzing fire risk:", err);
      
      // If we have cached result, keep showing it
      if (!result) {
        const fallbackResult = generateFallbackAnalysis(temperature, gasLevel, humidity);
        setResult(fallbackResult);
      }
      
      toast({
        title: "Lỗi phân tích",
        description: "Đang sử dụng phân tích offline.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fallback analysis when API is unavailable
  const generateFallbackAnalysis = (temp: number, gas: number, hum: number): FireRiskResult => {
    let riskScore = 0;
    const factors: string[] = [];

    // Temperature analysis
    if (temp > 45) {
      riskScore += 40;
      factors.push("Nhiệt độ rất cao");
    } else if (temp > 35) {
      riskScore += 20;
      factors.push("Nhiệt độ cao");
    }

    // Gas analysis
    if (gas > 60) {
      riskScore += 50;
      factors.push("Khí gas nguy hiểm");
    } else if (gas > 30) {
      riskScore += 25;
      factors.push("Khí gas cao");
    }

    // Humidity analysis
    if (hum < 30) {
      riskScore += 10;
      factors.push("Độ ẩm thấp");
    }

    riskScore = Math.min(100, riskScore);
    
    // Determine risk level based on score
    const riskLevel: "safe" | "warning" | "danger" | "critical" = 
      riskScore >= 70 ? "critical" :
      riskScore >= 50 ? "danger" :
      riskScore >= 20 ? "warning" : "safe";

    // Humidity analysis
    if (hum < 30) {
      riskScore += 10;
      factors.push("Độ ẩm thấp");
    }

    riskScore = Math.min(100, riskScore);

    return {
      riskLevel,
      riskScore,
      smokeType: gas > 60 ? "real_smoke" : gas > 30 ? "cooking" : "none",
      analysis: "Phân tích offline dựa trên ngưỡng cảm biến. Kết nối AI để phân tích chi tiết hơn.",
      recommendation: riskLevel === "critical" 
        ? "Kiểm tra ngay lập tức! Nguy cơ cháy cao."
        : riskLevel === "danger"
        ? "Cần kiểm tra các nguồn nhiệt và khí gas."
        : riskLevel === "warning"
        ? "Theo dõi chặt chẽ các chỉ số."
        : "Tiếp tục giám sát bình thường.",
      factors
    };
  };

  // Auto-analyze when data changes significantly (increased cooldown to 2 minutes)
  useEffect(() => {
    const shouldAutoAnalyze = 
      !lastAnalyzed || 
      (new Date().getTime() - lastAnalyzed.getTime()) > 120000; // 2 minutes

    if (shouldAutoAnalyze && (temperature > 0 || gasLevel > 0)) {
      analyzeRisk();
    }
  }, [temperature, gasLevel]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "safe": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "danger": return "bg-orange-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "safe": return <Shield className="w-6 h-6 text-green-500" />;
      case "warning": return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case "danger": return <Flame className="w-6 h-6 text-orange-500" />;
      case "critical": return <Flame className="w-6 h-6 text-red-500 animate-pulse" />;
      default: return <Brain className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "safe": return "An toàn";
      case "warning": return "Cảnh báo";
      case "danger": return "Nguy hiểm";
      case "critical": return "Khẩn cấp";
      default: return "Chưa xác định";
    }
  };

  const getSmokeTypeLabel = (type: string) => {
    switch (type) {
      case "none": return "Không có khói";
      case "cooking": return "Khói nấu ăn";
      case "steam": return "Hơi nước";
      case "real_smoke": return "Khói thật";
      case "fire": return "Đám cháy";
      default: return type;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/30 border-border shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Phân Tích Nguy Cơ Cháy</h3>
            <p className="text-sm text-muted-foreground">
              Nhận diện sớm nguy cơ cháy bằng AI
            </p>
          </div>
        </div>
        <Button 
          onClick={() => analyzeRisk()} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="ml-2">{loading ? "Đang phân tích..." : "Phân tích"}</span>
        </Button>
      </div>

      {result ? (
        <div className="space-y-4">
          {/* Risk Level Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getRiskIcon(result.riskLevel)}
              <Badge className={`${getRiskColor(result.riskLevel)} text-white text-lg px-4 py-1`}>
                {getRiskLabel(result.riskLevel)}
              </Badge>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Điểm rủi ro</span>
                <span className="font-bold">{result.riskScore}/100</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRiskColor(result.riskLevel)} transition-all duration-500`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Smoke Type */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Loại khói:</span>
            <Badge variant="outline">{getSmokeTypeLabel(result.smokeType)}</Badge>
          </div>

          {/* Analysis */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" /> Phân tích AI
            </h4>
            <p className="text-sm text-muted-foreground">{result.analysis}</p>
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg ${
            result.riskLevel === "safe" ? "bg-green-500/10 border border-green-500/30" :
            result.riskLevel === "warning" ? "bg-yellow-500/10 border border-yellow-500/30" :
            "bg-red-500/10 border border-red-500/30"
          }`}>
            <h4 className="font-semibold mb-2">💡 Khuyến nghị</h4>
            <p className="text-sm">{result.recommendation}</p>
          </div>

          {/* Factors */}
          {result.factors && result.factors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.factors.map((factor, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          )}

          {/* Last Analyzed */}
          {lastAnalyzed && (
            <p className="text-xs text-muted-foreground text-right">
              Cập nhật: {lastAnalyzed.toLocaleTimeString("vi-VN")}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>AI đang phân tích dữ liệu cảm biến...</p>
            </div>
          ) : (
            <p>Nhấn "Phân tích" để AI đánh giá nguy cơ cháy</p>
          )}
        </div>
      )}
    </Card>
  );
};
