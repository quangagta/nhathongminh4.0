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
    const { isRaining, rainIntensity, history } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const now = new Date();
    const currentHour = now.getHours();
    const timeOfDay = currentHour < 12 ? "sáng" : currentHour < 18 ? "chiều" : "tối";

    console.log('Input data:', { isRaining, rainIntensity, timeOfDay, currentHour });
    console.log('Calling Lovable AI for rainfall analysis...');

    const systemPrompt = `Bạn là chuyên gia phân tích thời tiết và nông nghiệp thông minh cho hệ thống nhà thông minh tại Việt Nam.

Nhiệm vụ:
1. Phân tích tình trạng mưa hiện tại từ cảm biến
2. Đánh giá xu hướng mưa dựa trên lịch sử
3. Đưa ra khuyến nghị cho hoạt động nông nghiệp và sinh hoạt

Thang đo cường độ mưa:
- 0-20%: Không mưa
- 21-40%: Mưa phùn/mưa nhỏ
- 41-60%: Mưa vừa
- 61-80%: Mưa to
- 81-100%: Mưa rất to

Hãy trả về JSON với cấu trúc:
{
  "rainStatus": "none" | "light" | "moderate" | "heavy" | "very_heavy",
  "isRaining": boolean,
  "analysis": "Phân tích chi tiết tình trạng mưa hiện tại",
  "trend": "increasing" | "decreasing" | "stable" | "unknown",
  "trendAnalysis": "Phân tích xu hướng mưa dựa trên lịch sử",
  "agriculturalAdvice": "Khuyến nghị cho hoạt động nông nghiệp (tưới tiêu, thu hoạch...)",
  "lifestyleAdvice": "Khuyến nghị sinh hoạt (phơi đồ, ra ngoài...)",
  "forecast": "Dự báo thời tiết ngắn hạn dựa trên xu hướng",
  "waterSavingTip": "Mẹo tiết kiệm nước dựa trên tình hình mưa"
}`;

    const historyInfo = history && history.length > 0 
      ? `\nLịch sử mưa gần đây:\n${history.slice(-10).map((h: any) => 
          `- ${h.time}: Cường độ ${h.intensity}%, ${h.isRaining ? 'Đang mưa' : 'Không mưa'}`
        ).join('\n')}`
      : '\nChưa có dữ liệu lịch sử mưa.';

    const userPrompt = `Phân tích tình trạng mưa với dữ liệu sau:

Thời điểm: ${timeOfDay} (${currentHour}h)
Trạng thái hiện tại: ${isRaining ? 'Đang mưa' : 'Không mưa'}
Cường độ mưa: ${rainIntensity}%
${historyInfo}

Hãy đưa ra phân tích chi tiết và khuyến nghị phù hợp.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    console.log('AI response received:', content);

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback analysis
      result = {
        rainStatus: rainIntensity > 80 ? "very_heavy" : rainIntensity > 60 ? "heavy" : rainIntensity > 40 ? "moderate" : rainIntensity > 20 ? "light" : "none",
        isRaining: isRaining,
        analysis: isRaining ? `Đang mưa với cường độ ${rainIntensity}%` : "Hiện tại không mưa",
        trend: "unknown",
        trendAnalysis: "Không đủ dữ liệu để phân tích xu hướng",
        agriculturalAdvice: isRaining ? "Tạm dừng tưới tiêu, để tự nhiên hấp thụ nước mưa" : "Có thể tiến hành tưới tiêu bình thường",
        lifestyleAdvice: isRaining ? "Nên mang ô khi ra ngoài, tránh phơi đồ" : "Thời tiết thuận lợi cho các hoạt động ngoài trời",
        forecast: "Cần thêm dữ liệu để dự báo chính xác",
        waterSavingTip: isRaining ? "Tận dụng nước mưa để tưới cây" : "Tiết kiệm nước bằng cách tưới vào sáng sớm hoặc chiều tối"
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-rainfall:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      rainStatus: "unknown",
      isRaining: false,
      analysis: "Không thể phân tích do lỗi kết nối",
      trend: "unknown",
      trendAnalysis: "Không có dữ liệu",
      agriculturalAdvice: "Vui lòng thử lại sau",
      lifestyleAdvice: "Vui lòng thử lại sau",
      forecast: "Không có dữ liệu",
      waterSavingTip: "Vui lòng thử lại sau"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
