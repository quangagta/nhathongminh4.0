import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  email: string;
  alertType: "gas" | "temperature" | "fire";
  currentValue: number;
  threshold: number;
  gasLevel?: number;
  temperature?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, alertType, currentValue, threshold, gasLevel, temperature }: AlertEmailRequest = await req.json();

    console.log("Sending alert email:", { email, alertType, currentValue, threshold });

    if (!email || !alertType) {
      throw new Error("Missing required fields: email and alertType");
    }

    let subject = "";
    let htmlContent = "";
    const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    if (alertType === "gas") {
      subject = "🚨 CẢNH BÁO KHÍ GAS CAO - Nhà Thông Minh";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff3cd; border: 2px solid #ff6b6b; border-radius: 10px;">
          <h1 style="color: #dc3545; text-align: center;">🚨 CẢNH BÁO KHÍ GAS</h1>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; margin: 10px 0;"><strong>Mức khí gas hiện tại:</strong> <span style="color: #dc3545; font-size: 24px; font-weight: bold;">${currentValue} ppm</span></p>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Ngưỡng cảnh báo:</strong> ${threshold} ppm</p>
            <p style="font-size: 14px; color: #666; margin: 10px 0;"><strong>Thời gian:</strong> ${timestamp}</p>
          </div>
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">⚠️ Khuyến nghị:</h3>
            <ul style="color: #721c24;">
              <li>Kiểm tra bếp gas và các thiết bị sử dụng gas</li>
              <li>Mở cửa sổ để thông gió</li>
              <li>Không bật lửa hoặc công tắc điện</li>
              <li>Liên hệ đơn vị cứu hỏa nếu tình trạng nghiêm trọng</li>
            </ul>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px;">Tin nhắn tự động từ Hệ thống Nhà Thông Minh IoT</p>
        </div>
      `;
    } else if (alertType === "temperature") {
      subject = "🌡️ CẢNH BÁO NHIỆT ĐỘ CAO - Nhà Thông Minh";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff3cd; border: 2px solid #fd7e14; border-radius: 10px;">
          <h1 style="color: #fd7e14; text-align: center;">🌡️ CẢNH BÁO NHIỆT ĐỘ</h1>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; margin: 10px 0;"><strong>Nhiệt độ hiện tại:</strong> <span style="color: #fd7e14; font-size: 24px; font-weight: bold;">${currentValue}°C</span></p>
            <p style="font-size: 16px; margin: 10px 0;"><strong>Ngưỡng cảnh báo:</strong> ${threshold}°C</p>
            <p style="font-size: 14px; color: #666; margin: 10px 0;"><strong>Thời gian:</strong> ${timestamp}</p>
          </div>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Khuyến nghị:</h3>
            <ul style="color: #856404;">
              <li>Kiểm tra nguồn nhiệt bất thường</li>
              <li>Bật quạt hoặc điều hòa để giảm nhiệt</li>
              <li>Theo dõi tình trạng nhiệt độ liên tục</li>
            </ul>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px;">Tin nhắn tự động từ Hệ thống Nhà Thông Minh IoT</p>
        </div>
      `;
    } else if (alertType === "fire") {
      subject = "🔥 NGUY CƠ CHÁY CAO - Nhà Thông Minh";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8d7da; border: 3px solid #dc3545; border-radius: 10px;">
          <h1 style="color: #dc3545; text-align: center;">🔥 NGUY CƠ CHÁY CAO</h1>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; margin: 10px 0;"><strong>Mức khí gas:</strong> <span style="color: #dc3545; font-size: 24px; font-weight: bold;">${gasLevel || currentValue} ppm</span></p>
            <p style="font-size: 18px; margin: 10px 0;"><strong>Nhiệt độ:</strong> <span style="color: #fd7e14; font-size: 24px; font-weight: bold;">${temperature || 0}°C</span></p>
            <p style="font-size: 14px; color: #666; margin: 10px 0;"><strong>Thời gian:</strong> ${timestamp}</p>
          </div>
          <div style="background-color: #dc3545; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #fff; margin-top: 0;">🚨 HÀNH ĐỘNG NGAY:</h3>
            <ul style="color: #fff;">
              <li>Di chuyển ra khỏi khu vực nguy hiểm</li>
              <li>Gọi điện cho lực lượng cứu hỏa: 114</li>
              <li>Không sử dụng thang máy</li>
              <li>Cảnh báo những người xung quanh</li>
            </ul>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px;">Tin nhắn tự động từ Hệ thống Nhà Thông Minh IoT</p>
        </div>
      `;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Smart Home Alert <alert@nhathongminh.thptxt.com>",
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-alert-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
