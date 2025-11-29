import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { database } from '@/config/firebase';
import { toast } from 'sonner';

export const useDoorControl = () => {
  const [password, setPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const doorStatusRef = ref(database, 'controls/door');
    
    const unsubscribe = onValue(doorStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsUnlocked(snapshot.val());
      }
    });

    return () => {
      unsubscribe();
      // Cleanup timer khi component unmount
      if (autoLockTimerRef.current) {
        clearTimeout(autoLockTimerRef.current);
      }
    };
  }, []);

  const verifyAndUnlock = async (inputPassword: string) => {
    setLoading(true);
    try {
      const passwordRef = ref(database, 'security/doorPassword');
      const snapshot = await get(passwordRef);
      
      const storedPassword = snapshot.exists() ? snapshot.val() : '1234'; // Mật khẩu mặc định
      
      if (inputPassword === storedPassword) {
        // Xóa timer cũ nếu có
        if (autoLockTimerRef.current) {
          clearTimeout(autoLockTimerRef.current);
        }
        
        await set(ref(database, 'controls/door'), true);
        toast.success('Mở khóa thành công!');
        
        // Tự động khóa lại sau 5 giây
        autoLockTimerRef.current = setTimeout(async () => {
          console.log('Auto-locking door...');
          await set(ref(database, 'controls/door'), false);
          toast.info('Đã tự động khóa lại');
          autoLockTimerRef.current = null;
        }, 5000);
      } else {
        toast.error('Mật khẩu không đúng!');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      toast.error('Lỗi khi xác thực mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const passwordRef = ref(database, 'security/doorPassword');
      const snapshot = await get(passwordRef);
      
      const storedPassword = snapshot.exists() ? snapshot.val() : '1234';
      
      if (oldPassword === storedPassword) {
        await set(passwordRef, newPassword);
        toast.success('Đổi mật khẩu thành công!');
        return true;
      } else {
        toast.error('Mật khẩu cũ không đúng!');
        return false;
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Lỗi khi đổi mật khẩu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const lockDoor = async () => {
    try {
      // Xóa timer tự động khóa nếu đang chạy
      if (autoLockTimerRef.current) {
        clearTimeout(autoLockTimerRef.current);
        autoLockTimerRef.current = null;
      }
      
      await set(ref(database, 'controls/door'), false);
      toast.success('Đã khóa cửa');
    } catch (error) {
      console.error('Error locking door:', error);
      toast.error('Lỗi khi khóa cửa');
    }
  };

  return {
    isUnlocked,
    loading,
    verifyAndUnlock,
    changePassword,
    lockDoor
  };
};
