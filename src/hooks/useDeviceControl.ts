import { ref, set, get } from "firebase/database";
import { database } from "@/config/firebase";
import { toast } from "sonner";

export interface DeviceStates {
  light1: boolean;
  light2: boolean;
  fan: boolean;
  pump: boolean;
}

/**
 * Hook để điều khiển thiết bị qua Firebase
 * Web gửi lệnh lên Firebase, Arduino sẽ đọc và thực thi
 */
export const useDeviceControl = () => {
  
  // Hàm gửi lệnh điều khiển lên Firebase
  const sendControlCommand = async (device: keyof DeviceStates, state: boolean) => {
    try {
      const path = `controls/${device}`;
      console.log(`Gửi lệnh điều khiển: ${path} = ${state}`);
      const controlRef = ref(database, path);
      await set(controlRef, state);
      console.log(`Đã gửi thành công: ${path} = ${state}`);
      
      toast.success(`Đã ${state ? 'bật' : 'tắt'} ${getDeviceName(device)}`);
      return true;
    } catch (error) {
      console.error("Lỗi gửi lệnh điều khiển:", error);
      toast.error(`Không thể điều khiển ${getDeviceName(device)}`);
      return false;
    }
  };

  // Hàm đọc trạng thái hiện tại từ Firebase
  const getDeviceState = async (device: keyof DeviceStates): Promise<boolean> => {
    try {
      const controlRef = ref(database, `controls/${device}`);
      const snapshot = await get(controlRef);
      return snapshot.val() || false;
    } catch (error) {
      console.error("Lỗi đọc trạng thái:", error);
      return false;
    }
  };

  // Hàm đọc tất cả trạng thái
  const getAllDeviceStates = async (): Promise<DeviceStates> => {
    try {
      const controlRef = ref(database, 'controls');
      const snapshot = await get(controlRef);
      return snapshot.val() || {
        light1: false,
        light2: false,
        fan: false,
        pump: false
      };
    } catch (error) {
      console.error("Lỗi đọc trạng thái:", error);
      return {
        light1: false,
        light2: false,
        fan: false,
        pump: false
      };
    }
  };

  // Helper function để lấy tên thiết bị
  const getDeviceName = (device: keyof DeviceStates): string => {
    const names = {
      light1: "đèn 1",
      light2: "đèn 2",
      fan: "quạt",
      pump: "bơm nước"
    };
    return names[device];
  };

  return {
    sendControlCommand,
    getDeviceState,
    getAllDeviceStates
  };
};
