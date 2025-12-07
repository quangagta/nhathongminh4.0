import { ref, set, get } from "firebase/database";
import { database } from "@/config/firebase";
import { toast } from "sonner";

export interface DeviceStates {
  light1: boolean;
  light2: boolean;
  fan: boolean;
  pump: boolean;
}

// Mapping device keys to Firebase paths
const devicePaths: Record<keyof DeviceStates, string> = {
  light1: 'Den_TrangThai_HienThi',
  light2: 'Den_TrangThai_HienThi',
  fan: 'Quat_TrangThai_HienThi',
  pump: 'Pump_TrangThai_HienThi'
};

/**
 * Hook để điều khiển thiết bị qua Firebase
 * Web gửi lệnh lên Firebase, Arduino sẽ đọc và thực thi
 */
export const useDeviceControl = () => {
  
  // Hàm gửi lệnh điều khiển lên Firebase
  const sendControlCommand = async (device: keyof DeviceStates, state: boolean) => {
    try {
      const path = devicePaths[device];
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
      const path = devicePaths[device];
      const controlRef = ref(database, path);
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
      const light1Ref = ref(database, devicePaths.light1);
      const fanRef = ref(database, devicePaths.fan);
      const pumpRef = ref(database, devicePaths.pump);
      
      const [light1Snap, fanSnap, pumpSnap] = await Promise.all([
        get(light1Ref),
        get(fanRef),
        get(pumpRef)
      ]);
      
      return {
        light1: light1Snap.val() || false,
        light2: light1Snap.val() || false,
        fan: fanSnap.val() || false,
        pump: pumpSnap.val() || false
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
