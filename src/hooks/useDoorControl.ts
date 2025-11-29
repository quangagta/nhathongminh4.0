import { useState, useEffect } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { database } from '@/config/firebase';
import { toast } from 'sonner';

export const useDoorControl = () => {
  const [password, setPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const doorStatusRef = ref(database, 'controls/door');
    
    const unsubscribe = onValue(doorStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsUnlocked(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  const verifyAndUnlock = async (inputPassword: string) => {
    setLoading(true);
    try {
      const passwordRef = ref(database, 'security/doorPassword');
      const snapshot = await get(passwordRef);
      
      const storedPassword = snapshot.exists() ? snapshot.val() : '1234'; // Mật khẩu mặc định
      
      if (inputPassword === storedPassword) {
        await set(ref(database, 'controls/door'), true);
        setIsUnlocked(true);
        toast.success('Mở khóa thành công!');
        
        // Tự động khóa lại sau 5 giây
        setTimeout(async () => {
          await set(ref(database, 'controls/door'), false);
          setIsUnlocked(false);
          toast.info('Đã tự động khóa lại');
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
      await set(ref(database, 'controls/door'), false);
      setIsUnlocked(false);
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
