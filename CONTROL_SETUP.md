# Hướng Dẫn Điều Khiển Thiết Bị Qua Web

## Tổng Quan

Hệ thống cho phép điều khiển thiết bị từ xa qua web interface:
- **Web** → Firebase → **Arduino** → Thiết bị

## Cách Hoạt Động

1. Người dùng bật/tắt thiết bị trên web
2. Web gửi lệnh lên Firebase Realtime Database tại path `/controls/`
3. Arduino đọc lệnh từ Firebase mỗi giây
4. Arduino điều khiển GPIO để bật/tắt thiết bị thực tế

## Cấu Trúc Dữ Liệu Firebase

```json
{
  "controls": {
    "light1": true,    // Đèn 1 (Indoor)
    "light2": false,   // Đèn 2 (Indoor) - Dự phòng
    "fan": true,       // Quạt (Indoor)
    "pump": false      // Bơm nước (Outdoor)
  },
  "sensors": {
    "current": {
      "temperature": 26.5,
      "gasLevel": 15,
      "humidity": 65,
      "timestamp": "123456789"
    }
  }
}
```

## Thiết Lập Arduino

### 1. Upload Code Điều Khiển

Upload file `arduino/firebase_control_receiver.ino` lên ESP8266/ESP01:

```cpp
// Cấu hình WiFi và Firebase
#define WIFI_SSID "TEN_WIFI_CUA_BAN"
#define WIFI_PASSWORD "MAT_KHAU_WIFI"
#define FIREBASE_HOST "nhalinhtinh-56f89-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "YOUR_DATABASE_SECRET"
```

### 2. Kết Nối Phần Cứng

#### Cho ESP-01 (2 GPIO):
- **GPIO0** → Relay Đèn 1
- **GPIO2** → Relay Quạt

#### Cho NodeMCU (nhiều GPIO):
- **GPIO0 (D3)** → Relay Đèn 1
- **GPIO2 (D4)** → Relay Đèn 2
- **GPIO4 (D2)** → Relay Quạt
- **GPIO5 (D1)** → Relay Bơm nước

### 3. Sơ Đồ Kết Nối Relay

```
ESP8266          Relay Module         Thiết Bị
--------         ------------         --------
GPIO x  -----→   IN                  
3.3V    -----→   VCC                
GND     -----→   GND                 
                 COM      -----→     Nguồn AC/DC
                 NO       -----→     Thiết bị (đèn, quạt,...)
```

**Lưu ý:**
- Sử dụng relay module 5V với opto-isolator
- GPIO ESP8266 output 3.3V, cần relay tương thích
- Relay LOW-triggered hoặc HIGH-triggered (điều chỉnh code cho phù hợp)

## Thiết Lập Firebase Rules

Đảm bảo Firebase Rules cho phép đọc/ghi:

```json
{
  "rules": {
    "controls": {
      ".read": true,
      ".write": true
    },
    "sensors": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **Lưu ý bảo mật:** Rules trên cho phép truy cập công khai. Trong production nên thêm authentication:

```json
{
  "rules": {
    "controls": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Thiết Lập Web

Code web đã được cấu hình sẵn trong:
- `src/hooks/useDeviceControl.ts` - Hook gửi lệnh điều khiển
- `src/pages/Indoor.tsx` - Điều khiển đèn và quạt
- `src/pages/Outdoor.tsx` - Điều khiển bơm nước

### Cấu Hình Firebase (Web)

Đảm bảo file `src/config/firebase.ts` đã được cấu hình đúng:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "nhalinhtinh-56f89.firebaseapp.com",
  databaseURL: "https://nhalinhtinh-56f89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nhalinhtinh-56f89",
  storageBucket: "nhalinhtinh-56f89.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Kiểm Tra Hệ Thống

### 1. Kiểm Tra Web
- Mở web interface
- Vào trang "Trong Nhà" hoặc "Vườn Rau"
- Bật/tắt thiết bị
- Kiểm tra toast notification thành công

### 2. Kiểm Tra Firebase
- Mở Firebase Console
- Vào Realtime Database
- Xem path `/controls/`
- Giá trị phải thay đổi khi toggle trên web

### 3. Kiểm Tra Arduino
- Mở Serial Monitor (115200 baud)
- Xem log khi web gửi lệnh:
```
Đèn 1: BẬT
Quạt: TẮT
Bơm nước: BẬT
```

## Xử Lý Lỗi

### Lỗi: Arduino không nhận lệnh
- ✓ Kiểm tra kết nối WiFi (xem Serial Monitor)
- ✓ Kiểm tra Firebase URL và AUTH đúng
- ✓ Kiểm tra Firebase Rules cho phép đọc
- ✓ Kiểm tra path `/controls/` có tồn tại

### Lỗi: Web không gửi được lệnh
- ✓ Mở Console (F12) xem lỗi Firebase
- ✓ Kiểm tra Firebase config trong `firebase.ts`
- ✓ Kiểm tra Firebase Rules cho phép ghi
- ✓ Kiểm tra kết nối internet

### Lỗi: Relay không hoạt động
- ✓ Kiểm tra GPIO pin đúng
- ✓ Kiểm tra relay module có nguồn
- ✓ Đảm bảo relay tương thích 3.3V logic
- ✓ Kiểm tra loại relay (LOW/HIGH triggered)

## Nâng Cao

### Thêm Phản Hồi Trạng Thái Thực Tế

Để web hiển thị trạng thái thật từ Arduino:

```cpp
// Trong Arduino - Gửi trạng thái thực tế lên Firebase
void sendDeviceStatus() {
  Firebase.setBool(firebaseData, "/status/light1", light1State);
  Firebase.setBool(firebaseData, "/status/fan", fanState);
  Firebase.setBool(firebaseData, "/status/pump", pumpState);
}
```

### Thêm Điều Khiển Tự Động

Ví dụ: Tự động bật quạt khi nhiệt độ cao

```cpp
if (temperature > 30 && !fanState) {
  fanState = true;
  digitalWrite(FAN_PIN, HIGH);
  Firebase.setBool(firebaseData, "/controls/fan", true);
  Serial.println("Tự động bật quạt - Nhiệt độ cao!");
}
```

### Kết Hợp Sender + Receiver

Để Arduino vừa gửi cảm biến vừa nhận điều khiển, kết hợp 2 code:
- `firebase_sender.ino` - Gửi dữ liệu cảm biến
- `firebase_control_receiver.ino` - Nhận lệnh điều khiển

## Tài Liệu Tham Khảo

- [Firebase ESP8266 Library](https://github.com/mobizt/Firebase-ESP8266)
- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [ESP8266 GPIO Reference](https://randomnerdtutorials.com/esp8266-pinout-reference-gpios/)
