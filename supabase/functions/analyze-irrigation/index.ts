import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { humidity, temperature, history } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentHour = new Date().getHours();
    const timeOfDay = currentHour >= 5 && currentHour < 12 ? "sáng" : 
                      currentHour >= 12 && currentHour < 17 ? "chiều" : 
                      currentHour >= 17 && currentHour < 21 ? "tối" : "đêm";

    const systemPrompt = `Bạn là chuyên gia AI phân tích tưới cây thông minh cho hệ thống vườn rau IoT sử dụng năng lượng mặt trời.

Nhiệm vụ:
1. Phân tích độ ẩm đất hiện tại và đánh giá nhu cầu tưới
2. Dự đoán thời điểm cần tưới dựa trên xu hướng
3. Đề xuất lịch tưới tối ưu kết hợp năng lượng mặt trời
4. Ước tính lượng nước và thời gian tưới phù hợp

Ngưỡng độ ẩm đất:
- < 30%: Rất khô - cần tưới ngay
- 30-45%: Khô - nên tưới sớm  
- 45-60%: Tối ưu - không cần tưới
- 60-75%: Ẩm - giảm tưới
- > 75%: Quá ẩm - ngừng tưới

Nguyên tắc tối ưu năng lượng mặt trời:
- Thời điểm tốt nhất: 9h-11h sáng (pin đầy, chưa quá nóng)
- Tránh tưới: 12h-15h (nóng nhất, bay hơi nhanh)
- Buổi chiều: 16h-18h (mát, tiết kiệm nước)
- Không tưới đêm (vi khuẩn, nấm phát triển)

Trả về JSON với format:
{
  "soilStatus": "very_dry|dry|optimal|moist|wet",
  "needsWatering": true/false,
  "urgencyLevel": "immediate|soon|none|reduce",
  "waterAmount": số ml ước tính (0 nếu không cần),
  "durationMinutes": số phút tưới (0 nếu không cần),
  "optimalTime": "thời điểm tưới tốt nhất",
  "solarOptimized": true/false,
  "analysis": "phân tích ngắn gọn 2-3 câu",
  "recommendation": "đề xuất hành động cụ thể",
  "nextWateringPrediction": "dự đoán thời điểm cần tưới tiếp theo",
  "energySavingTip": "mẹo tiết kiệm năng lượng"
}`;

    const userPrompt = `Phân tích tình trạng tưới cây:

Thời điểm hiện tại: ${timeOfDay} (${currentHour}h)
Độ ẩm đất: ${humidity}%
Nhiệt độ: ${temperature}°C

${history && history.length > 0 ? `Lịch sử độ ẩm gần đây:
${history.slice(-10).map((h: any) => `- ${h.time}: ${h.humidity}%`).join('\n')}` : 'Chưa có dữ liệu lịch sử'}

Hãy phân tích và đưa ra đề xuất tưới cây thông minh, tối ưu năng lượng mặt trời.`;

    console.log("Calling Lovable AI for irrigation analysis...");
    console.log("Input data:", { humidity, temperature, timeOfDay, currentHour });

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
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log("AI response received:", content);

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback analysis based on humidity
      result = {
        soilStatus: humidity < 30 ? "very_dry" : humidity < 45 ? "dry" : humidity < 60 ? "optimal" : humidity < 75 ? "moist" : "wet",
        needsWatering: humidity < 45,
        urgencyLevel: humidity < 30 ? "immediate" : humidity < 45 ? "soon" : "none",
        waterAmount: humidity < 30 ? 500 : humidity < 45 ? 300 : 0,
        durationMinutes: humidity < 30 ? 10 : humidity < 45 ? 5 : 0,
        optimalTime: "9:00 - 11:00 sáng",
        solarOptimized: true,
        analysis: "Phân tích dựa trên độ ẩm hiện tại.",
        recommendation: humidity < 45 ? "Nên bật máy bơm tưới cây." : "Độ ẩm đủ, chưa cần tưới.",
        nextWateringPrediction: "Cần theo dõi thêm",
        energySavingTip: "Tưới vào buổi sáng khi pin mặt trời đầy năng lượng."
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-irrigation function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
