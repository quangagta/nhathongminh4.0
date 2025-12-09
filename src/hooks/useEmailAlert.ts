import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EMAIL_COOLDOWN_MS = 300000; // 5 minutes cooldown between emails

export const useEmailAlert = () => {
  const lastEmailSent = useRef<{ gas: number; temp: number; fire: number }>({ 
    gas: 0, 
    temp: 0, 
    fire: 0 
  });

  const sendAlertEmail = useCallback(async (
    email: string,
    alertType: 'gas' | 'temperature' | 'fire',
    currentValue: number,
    threshold: number,
    additionalData?: { gasLevel?: number; temperature?: number }
  ) => {
    const now = Date.now();
    const lastSent = lastEmailSent.current[alertType];

    // Check cooldown
    if (now - lastSent < EMAIL_COOLDOWN_MS) {
      console.log(`Email alert for ${alertType} skipped - cooldown active`);
      return false;
    }

    try {
      console.log(`Sending ${alertType} alert email to ${email}`);
      
      const { data, error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          email,
          alertType,
          currentValue,
          threshold,
          ...additionalData
        }
      });

      if (error) {
        console.error('Error sending alert email:', error);
        toast.error('Không thể gửi email cảnh báo');
        return false;
      }

      lastEmailSent.current[alertType] = now;
      toast.success(`📧 Đã gửi email cảnh báo ${alertType === 'gas' ? 'khí gas' : alertType === 'temperature' ? 'nhiệt độ' : 'nguy cơ cháy'} đến ${email}`);
      return true;
    } catch (err) {
      console.error('Failed to send alert email:', err);
      toast.error('Lỗi khi gửi email cảnh báo');
      return false;
    }
  }, []);

  return { sendAlertEmail };
};
