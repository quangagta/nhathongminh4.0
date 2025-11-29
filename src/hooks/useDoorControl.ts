import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set, get, push, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/config/firebase';
import { toast } from 'sonner';

export interface DoorHistoryEntry {
  id: string;
  unlockedAt: number;
  lockedAt?: number;
  duration?: number;
  autoLocked: boolean;
}

export const useDoorControl = () => {
  const [password, setPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<DoorHistoryEntry[]>([]);
  const [autoLockDelay, setAutoLockDelay] = useState<number>(() => {
    const saved = localStorage.getItem('doorAutoLockDelay');
    return saved ? parseInt(saved) : 5;
  });
  const autoLockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSessionRef = useRef<string | null>(null);

  const updateAutoLockDelay = (seconds: number) => {
    setAutoLockDelay(seconds);
    localStorage.setItem('doorAutoLockDelay', seconds.toString());
  };

  // Lấy lịch sử từ Firebase
  useEffect(() => {
    const historyRef = query(
      ref(database, 'doorHistory'),
      orderByChild('unlockedAt'),
      limitToLast(10)
    );
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      console.log('History snapshot received:', snapshot.exists());
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('History data:', data);
        const historyArray: DoorHistoryEntry[] = Object.entries(data).map(([id, entry]: [string, any]) => ({
          id,
          unlockedAt: entry.unlockedAt,
          lockedAt: entry.lockedAt,
          duration: entry.duration,
          autoLocked: entry.autoLocked
        })).sort((a, b) => b.unlockedAt - a.unlockedAt);
        console.log('History array:', historyArray.length, 'entries');
        setHistory(historyArray);
      } else {
        console.log('No history data found');
        setHistory([]);
      }
    }, (error) => {
      console.error('Error loading history:', error);
      toast.error('Không thể tải lịch sử');
    });

    return () => unsubscribe();
  }, []);

  // Ghi lại thời gian mở khóa
  const recordUnlock = async () => {
    try {
      console.log('Recording unlock...');
      const historyRef = ref(database, 'doorHistory');
      const newEntry = push(historyRef);
      currentSessionRef.current = newEntry.key;
      
      await set(newEntry, {
        unlockedAt: Date.now(),
        autoLocked: false
      });
      console.log('Unlock recorded successfully:', newEntry.key);
    } catch (error) {
      console.error('Error recording unlock:', error);
      toast.error('Không thể ghi lịch sử mở khóa');
    }
  };

  // Ghi lại thời gian khóa lại
  const recordLock = async (autoLocked: boolean) => {
    try {
      if (currentSessionRef.current) {
        console.log('Recording lock...', currentSessionRef.current);
        const entryRef = ref(database, `doorHistory/${currentSessionRef.current}`);
        const snapshot = await get(entryRef);
        
        if (snapshot.exists()) {
          const unlockedAt = snapshot.val().unlockedAt;
          const lockedAt = Date.now();
          const duration = Math.round((lockedAt - unlockedAt) / 1000); // duration in seconds
          
          await set(entryRef, {
            unlockedAt,
            lockedAt,
            duration,
            autoLocked
          });
          console.log('Lock recorded successfully');
        } else {
          console.warn('Entry not found for lock recording');
        }
        
        currentSessionRef.current = null;
      }
    } catch (error) {
      console.error('Error recording lock:', error);
      toast.error('Không thể ghi lịch sử khóa');
    }
  };

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
        await recordUnlock(); // Ghi lại lịch sử mở khóa
        toast.success(`Mở khóa thành công! Sẽ tự động khóa sau ${autoLockDelay}s`);
        
        // Tự động khóa lại sau thời gian đã chọn
        autoLockTimerRef.current = setTimeout(async () => {
          console.log('Auto-locking door...');
          await set(ref(database, 'controls/door'), false);
          await recordLock(true); // Ghi lại lịch sử khóa tự động
          toast.info('Đã tự động khóa lại');
          autoLockTimerRef.current = null;
        }, autoLockDelay * 1000);
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
      await recordLock(false); // Ghi lại lịch sử khóa thủ công
      toast.success('Đã khóa cửa');
    } catch (error) {
      console.error('Error locking door:', error);
      toast.error('Lỗi khi khóa cửa');
    }
  };

  return {
    isUnlocked,
    loading,
    history,
    autoLockDelay,
    updateAutoLockDelay,
    verifyAndUnlock,
    changePassword,
    lockDoor
  };
};
