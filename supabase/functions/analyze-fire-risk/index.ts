import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { temperature, gasLevel, humidity, history } = await req.json();
    
    console.log('Analyzing fire risk with data:', { temperature, gasLevel, humidity, historyLength: history?.length || 0 });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Bạn là hệ thống AI phân tích nguy cơ cháy thông minh cho nhà thông minh IoT. 
Nhiệm vụ của bạn là phân tích dữ liệu từ các cảm biến (nhiệt độ, khí gas, độ ẩm) để:

1. Phân loại khói thật vs khói giả (nấu ăn, hơi nước...)
2. Nhận diện mẫu bất thường dựa trên lịch sử
3. Dự đoán sớm nguy cơ cháy
4. Đưa ra cảnh báo và khuyến nghị

Quy tắc phân tích:
- Nhiệt độ bình thường: 20-35°C, cảnh báo: 35-45°C, nguy hiểm: >45°C
- Khí gas an toàn: 0-30 ppm, cảnh báo: 30-60 ppm, nguy hiểm: >60 ppm
- Độ ẩm tối ưu: 50-70%, khô (dễ cháy): <30%

Trả về JSON với format:
{
  "riskLevel": "safe" | "warning" | "danger" | "critical",
  "riskScore": 0-100,
  "smokeType": "none" | "cooking" | "steam" | "real_smoke" | "fire",
  "analysis": "Phân tích chi tiết...",
  "recommendation": "Khuyến nghị hành động...",
  "factors": ["yếu tố 1", "yếu tố 2"]
}`;

    const userPrompt = `Phân tích dữ liệu cảm biến hiện tại:
- Nhiệt độ: ${temperature}°C
- Khí gas: ${gasLevel} ppm
- Độ ẩm đất: ${humidity}%

${history && history.length > 0 ? `Lịch sử 5 phút gần nhất:
${history.map((h: any, i: number) => `${i + 1}. Nhiệt độ: ${h.temperature}°C, Gas: ${h.gasLevel}ppm`).join('\n')}` : 'Chưa có dữ liệu lịch sử.'}

Hãy phân tích và đưa ra đánh giá nguy cơ cháy.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    // Parse JSON from response
    let result;
    try {
      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response based on simple rules
      result = {
        riskLevel: gasLevel > 60 || temperature > 45 ? "danger" : gasLevel > 30 || temperature > 35 ? "warning" : "safe",
        riskScore: Math.min(100, (gasLevel / 100 * 50) + (temperature / 50 * 30) + (humidity < 30 ? 20 : 0)),
        smokeType: gasLevel > 60 ? "real_smoke" : gasLevel > 30 ? "cooking" : "none",
        analysis: "Phân tích tự động dựa trên ngưỡng cảm biến.",
        recommendation: gasLevel > 60 ? "Kiểm tra ngay lập tức!" : "Tiếp tục giám sát.",
        factors: []
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-fire-risk:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      riskLevel: "warning",
      riskScore: 50,
      analysis: "Không thể phân tích. Vui lòng thử lại.",
      recommendation: "Kiểm tra kết nối và thử lại."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
