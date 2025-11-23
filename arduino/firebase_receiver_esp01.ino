/*
 * ESP01 Firebase Data Receiver
 * Kết nối WiFi và đọc dữ liệu từ Firebase Realtime Database
 * Dành cho ESP-01 (ESP8266)
 */

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Cấu hình WiFi - THAY ĐỔI THÔNG TIN NÀY
#define WIFI_SSID "TEN_WIFI_CUA_BAN"
#define WIFI_PASSWORD "MAT_KHAU_WIFI"

// Cấu hình Firebase
#define FIREBASE_HOST "nhalinhtinh-56f89-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "DATABASE_SECRET_KEY"  // Lấy từ Firebase Console > Project Settings > Service accounts > Database secrets

// Firebase objects
FirebaseData firebaseData;

// Biến lưu trữ dữ liệu
float temperature = 0;
int gasLevel = 0;
int humidity = 0;
String lastUpdate = "";

// Thời gian đọc dữ liệu
unsigned long lastReadTime = 0;
const long readInterval = 3000;  // Đọc mỗi 3 giây

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== ESP01 Firebase Receiver ===");
  
  // Kết nối WiFi
  connectWiFi();
  
  // Khởi tạo Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  
  // Thiết lập buffer
  firebaseData.setBSSLBufferSize(1024, 1024);
  firebaseData.setResponseSize(1024);
  
  Serial.println("Sẵn sàng đọc dữ liệu từ Firebase!");
  Serial.println("---");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Kiểm tra kết nối WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Mất kết nối WiFi! Đang kết nối lại...");
    connectWiFi();
  }
  
  // Đọc dữ liệu từ Firebase
  if (currentTime - lastReadTime >= readInterval) {
    lastReadTime = currentTime;
    readDataFromFirebase();
  }
  
  delay(100);
}

// Hàm kết nối WiFi
void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Đang kết nối WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✓ Đã kết nối WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println("✗ Không thể kết nối WiFi!");
  }
}

// Hàm đọc dữ liệu từ Firebase
void readDataFromFirebase() {
  Serial.println("Đọc dữ liệu từ Firebase...");
  
  // Đọc nhiệt độ từ /sensors/current/temperature
  if (Firebase.getFloat(firebaseData, "/sensors/current/temperature")) {
    temperature = firebaseData.floatData();
    Serial.printf("  Nhiệt độ: %.1f°C\n", temperature);
  } else {
    Serial.println("  ✗ Lỗi đọc nhiệt độ: " + firebaseData.errorReason());
  }
  
  // Đọc mức khí gas từ /sensors/current/gasLevel
  if (Firebase.getInt(firebaseData, "/sensors/current/gasLevel")) {
    gasLevel = firebaseData.intData();
    Serial.printf("  Khí gas: %d ppm\n", gasLevel);
  } else {
    Serial.println("  ✗ Lỗi đọc khí gas: " + firebaseData.errorReason());
  }
  
  // Đọc độ ẩm từ /sensors/current/humidity
  if (Firebase.getInt(firebaseData, "/sensors/current/humidity")) {
    humidity = firebaseData.intData();
    Serial.printf("  Độ ẩm: %d%%\n", humidity);
  } else {
    Serial.println("  ✗ Lỗi đọc độ ẩm: " + firebaseData.errorReason());
  }
  
  // Đọc timestamp
  if (Firebase.getString(firebaseData, "/sensors/current/timestamp")) {
    lastUpdate = firebaseData.stringData();
    Serial.println("  Cập nhật: " + lastUpdate);
  }
  
  // Hiển thị toàn bộ dữ liệu JSON (tùy chọn)
  if (Firebase.getJSON(firebaseData, "/sensors/current")) {
    Serial.println("  JSON: " + firebaseData.jsonString());
  }
  
  Serial.println("---");
}

/*
 * HƯỚNG DẪN CÀI ĐẶT:
 * 
 * 1. Cài đặt thư viện Firebase ESP8266:
 *    - Mở Arduino IDE
 *    - Tools > Manage Libraries
 *    - Tìm "Firebase ESP8266 Client" by Mobizt
 *    - Cài đặt phiên bản mới nhất
 * 
 * 2. Cấu hình thông tin:
 *    - WIFI_SSID: Tên WiFi của bạn
 *    - WIFI_PASSWORD: Mật khẩu WiFi
 *    - FIREBASE_AUTH: Database secret key từ Firebase Console
 * 
 * 3. Lấy Firebase Database Secret:
 *    - Truy cập https://console.firebase.google.com
 *    - Chọn project "nhalinhtinh-56f89"
 *    - Vào Project Settings (biểu tượng bánh răng)
 *    - Tab "Service accounts"
 *    - Phần "Database secrets" > Show/Add secret
 *    - Copy secret key và dán vào FIREBASE_AUTH
 * 
 * 4. Cấu hình Firebase Rules (cho phép đọc dữ liệu):
 *    {
 *      "rules": {
 *        "sensors": {
 *          ".read": true,
 *          ".write": true
 *        }
 *      }
 *    }
 * 
 * 5. Kết nối ESP-01:
 *    - VCC -> 3.3V (Quan trọng: KHÔNG dùng 5V!)
 *    - GND -> GND
 *    - TX -> RX của USB-TTL
 *    - RX -> TX của USB-TTL
 *    - GPIO0 -> GND (khi nạp code)
 *    - CH_PD -> 3.3V
 * 
 * 6. Upload code:
 *    - Tools > Board > Generic ESP8266 Module
 *    - Tools > Flash Size > 1MB (FS:64KB OTA:~470KB)
 *    - Tools > Port > Chọn cổng COM phù hợp
 *    - Upload code
 * 
 * 7. Chạy chương trình:
 *    - Ngắt GPIO0 khỏi GND
 *    - Reset ESP-01
 *    - Mở Serial Monitor (115200 baud)
 * 
 * GIẢI THÍCH CẤU TRÚC DỮ LIỆU:
 * 
 * Firebase path: /sensors/current/
 * {
 *   "temperature": 26.5,
 *   "gasLevel": 15,
 *   "humidity": 65,
 *   "timestamp": "123456789"
 * }
 * 
 * Code sẽ đọc từng giá trị riêng lẻ và hiển thị lên Serial Monitor.
 */
