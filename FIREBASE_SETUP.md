# Hướng Dẫn Gửi Dữ Liệu Từ Arduino Lên Firebase

## 📋 Yêu Cầu

### Phần Cứng
- ESP8266 / NodeMCU / ESP32
- Cảm biến nhiệt độ (DHT11, DHT22, LM35, v.v.)
- Cảm biến khí gas (MQ-2, MQ-5, v.v.)
- Cảm biến độ ẩm đất
- Dây kết nối

### Phần Mềm
- Arduino IDE
- Thư viện: `Firebase ESP8266 Client` by Mobizt
- Thư viện: `ESP8266WiFi` (đã có sẵn)

## 🔧 Các Bước Thực Hiện

### Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** (Thêm dự án)
3. Đặt tên project (ví dụ: "smart-home-iot")
4. Bỏ Google Analytics (không cần thiết)
5. Click **"Create project"**

### Bước 2: Tạo Realtime Database

1. Trong Firebase Console, chọn **"Realtime Database"** từ menu bên trái
2. Click **"Create Database"**
3. Chọn vị trí server (ví dụ: `us-central1`)
4. Chọn **"Start in test mode"** (cho phép đọc/ghi tự do - chỉ dùng để test)
5. Click **"Enable"**

### Bước 3: Lấy Thông Tin Xác Thực

#### 3.1. Database URL
- Sau khi tạo database, bạn sẽ thấy URL dạng:
  ```
  https://ten-project-abc123.firebaseio.com/
  ```
- Lấy phần: `ten-project-abc123.firebaseio.com` (không có https:// và dấu /)

#### 3.2. Database Secret Key
1. Click vào biểu tượng ⚙️ (Settings) > **"Project settings"**
2. Chọn tab **"Service accounts"**
3. Kéo xuống phần **"Database secrets"**
4. Click **"Show"** để hiện secret key
5. Copy key này (dạng chuỗi dài ~40 ký tự)

### Bước 4: Cấu Hình Firebase Rules

Để cho phép Arduino ghi dữ liệu, cần cấu hình rules:

1. Trong Realtime Database, chọn tab **"Rules"**
2. Thay thế bằng code sau:

```json
{
  "rules": {
    "sensors": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click **"Publish"**

**⚠️ Lưu ý:** Rules này cho phép mọi người đọc/ghi. Chỉ dùng để test. Sau này cần bảo mật hơn.

### Bước 5: Cài Đặt Thư Viện Arduino

1. Mở Arduino IDE
2. Vào **Sketch > Include Library > Manage Libraries**
3. Tìm kiếm: **"Firebase ESP8266 Client"**
4. Cài đặt thư viện by **Mobizt** (phiên bản mới nhất)

### Bước 6: Cấu Hình Code Arduino

Mở file `arduino/firebase_sender.ino` và thay đổi:

```cpp
// WiFi của bạn
#define WIFI_SSID "TEN_WIFI_CUA_BAN"
#define WIFI_PASSWORD "MAT_KHAU_WIFI"

// Firebase credentials
#define FIREBASE_HOST "ten-project-abc123.firebaseio.com"  // URL từ bước 3.1
#define FIREBASE_AUTH "abcd1234xyz..."                      // Secret key từ bước 3.2
```

### Bước 7: Upload Code

1. Kết nối ESP8266/NodeMCU với máy tính
2. Chọn đúng Board và Port trong Arduino IDE
3. Click **Upload**
4. Mở Serial Monitor (115200 baud) để xem log

### Bước 8: Kiểm Tra Dữ Liệu

1. Trở lại Firebase Console
2. Vào Realtime Database
3. Bạn sẽ thấy dữ liệu xuất hiện trong `/sensors/current`:

```json
{
  "sensors": {
    "current": {
      "temperature": 26.5,
      "gasLevel": 15,
      "humidity": 65,
      "timestamp": "1234567890"
    },
    "history": {
      "1234567890": {
        "temperature": 26.5,
        "gasLevel": 15,
        "humidity": 65,
        "timestamp": "1234567890"
      }
    }
  }
}
```

## 🌐 Tích Hợp Firebase Vào Web App

### Bước 1: Cài Đặt Firebase SDK

Trong terminal của project web:

```bash
npm install firebase
```

### Bước 2: Lấy Firebase Config

1. Firebase Console > Project Settings
2. Scroll xuống phần **"Your apps"**
3. Click biểu tượng **Web** (`</>`)
4. Đăng ký app, lấy config object

### Bước 3: Tạo Firebase Service

Tạo file `src/lib/firebase.ts` với config của bạn.

### Bước 4: Đọc Dữ Liệu Realtime

Sử dụng Firebase Realtime Database listener để tự động cập nhật UI khi có dữ liệu mới từ Arduino.

## 🔒 Bảo Mật (Nên Làm Sau Khi Test Xong)

### Rules An Toàn Hơn

```json
{
  "rules": {
    "sensors": {
      ".read": true,
      ".write": "auth != null"  // Chỉ user đã đăng nhập mới ghi được
    }
  }
}
```

### Sử Dụng Firebase Auth Token

Thay vì dùng Database Secret, nên dùng Custom Token hoặc Service Account để an toàn hơn.

## 📊 Cấu Trúc Dữ Liệu Đề Xuất

```
sensors/
  ├── current/              # Dữ liệu hiện tại
  │   ├── temperature
  │   ├── gasLevel
  │   ├── humidity
  │   └── timestamp
  │
  ├── history/              # Lịch sử dữ liệu
  │   ├── {timestamp1}/
  │   ├── {timestamp2}/
  │   └── ...
  │
  └── devices/              # Trạng thái thiết bị
      ├── light/
      ├── fan/
      └── pump/
```

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Connection refused"
- Kiểm tra WiFi credentials
- Kiểm tra Firebase Host (không có https://)

### Lỗi: "Auth failed"
- Kiểm tra Firebase Auth key
- Kiểm tra Firebase Rules

### Lỗi: "SSL certificate verify failed"
```cpp
// Thêm vào setup()
firebaseData.setBSSLBufferSize(1024, 1024);
```

### Không thấy dữ liệu trên Firebase
- Kiểm tra Serial Monitor xem có lỗi không
- Kiểm tra path trong Firebase (`/sensors/current`)
- Kiểm tra Rules có cho phép write không

## 💡 Mẹo

- **Tiết kiệm năng lượng:** Tăng `sendInterval` lên 30-60 giây
- **Giới hạn lịch sử:** Tự động xóa dữ liệu cũ hơn 7 ngày
- **Nén dữ liệu:** Gửi nhiều sensor cùng lúc thay vì từng cái
- **Retry logic:** Thử lại khi gửi thất bại

## 🔗 Tài Nguyên

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase ESP8266 Client Library](https://github.com/mobizt/Firebase-ESP8266)
- [Arduino ESP8266 Core](https://github.com/esp8266/Arduino)
