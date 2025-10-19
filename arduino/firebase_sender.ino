/*
 * Arduino/ESP8266 Firebase Data Sender
 * Gửi dữ liệu cảm biến lên Firebase Realtime Database
 */

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// WiFi credentials
#define WIFI_SSID "TEN_WIFI_CUA_BAN"
#define WIFI_PASSWORD "MAT_KHAU_WIFI"

// Firebase credentials - Lấy từ Firebase Console
#define FIREBASE_HOST "ten-project.firebaseio.com"  // Không có https:// và không có dấu / ở cuối
#define FIREBASE_AUTH "DATABASE_SECRET_KEY"         // Database secret từ Firebase Console

// Firebase objects
FirebaseData firebaseData;

// Cấu hình chân kết nối cảm biến (thay đổi theo phần cứng của bạn)
#define TEMP_PIN A0      // Chân cảm biến nhiệt độ
#define GAS_PIN A1       // Chân cảm biến khí gas
#define HUMIDITY_PIN A2  // Chân cảm biến độ ẩm đất

// Thời gian gửi dữ liệu (milliseconds)
unsigned long lastSendTime = 0;
const long sendInterval = 5000;  // Gửi mỗi 5 giây

void setup() {
  Serial.begin(115200);
  
  // Kết nối WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Đang kết nối WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("Đã kết nối WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Khởi tạo Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  
  // Thiết lập timeout
  firebaseData.setBSSLBufferSize(1024, 1024);
  firebaseData.setResponseSize(1024);
  
  Serial.println("Khởi tạo Firebase thành công!");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Gửi dữ liệu theo khoảng thời gian đã định
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;
    
    // Đọc dữ liệu từ cảm biến
    float temperature = readTemperature();
    int gasLevel = readGasLevel();
    int humidity = readHumidity();
    
    // Tạo timestamp
    String timestamp = String(currentTime);
    
    // Gửi dữ liệu lên Firebase
    sendToFirebase(temperature, gasLevel, humidity, timestamp);
  }
  
  delay(100);
}

// Hàm đọc nhiệt độ (ví dụ cho DHT11/DHT22 hoặc cảm biến analog)
float readTemperature() {
  // Thay đổi code này theo cảm biến thực tế của bạn
  int rawValue = analogRead(TEMP_PIN);
  float temperature = (rawValue / 1024.0) * 50.0;  // Chuyển đổi sang độ C
  return temperature;
}

// Hàm đọc mức khí gas
int readGasLevel() {
  // Thay đổi code này theo cảm biến MQ-2, MQ-5, v.v.
  int rawValue = analogRead(GAS_PIN);
  int gasLevel = map(rawValue, 0, 1023, 0, 100);  // Chuyển sang %
  return gasLevel;
}

// Hàm đọc độ ẩm đất
int readHumidity() {
  // Thay đổi code này theo cảm biến độ ẩm của bạn
  int rawValue = analogRead(HUMIDITY_PIN);
  int humidity = map(rawValue, 0, 1023, 0, 100);  // Chuyển sang %
  return humidity;
}

// Hàm gửi dữ liệu lên Firebase
void sendToFirebase(float temp, int gas, int humidity, String timestamp) {
  Serial.println("Đang gửi dữ liệu lên Firebase...");
  
  // Tạo JSON object
  FirebaseJson json;
  json.set("temperature", temp);
  json.set("gasLevel", gas);
  json.set("humidity", humidity);
  json.set("timestamp", timestamp);
  
  // Gửi dữ liệu lên path /sensors/current
  if (Firebase.setJSON(firebaseData, "/sensors/current", json)) {
    Serial.println("✓ Gửi thành công!");
    Serial.printf("  Nhiệt độ: %.1f°C\n", temp);
    Serial.printf("  Khí gas: %d ppm\n", gas);
    Serial.printf("  Độ ẩm: %d%%\n", humidity);
  } else {
    Serial.println("✗ Gửi thất bại!");
    Serial.println("Lỗi: " + firebaseData.errorReason());
  }
  
  // Lưu vào lịch sử (optional) - path /sensors/history/{timestamp}
  String historyPath = "/sensors/history/" + timestamp;
  if (Firebase.setJSON(firebaseData, historyPath, json)) {
    Serial.println("✓ Đã lưu vào lịch sử");
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
 * 2. Tạo Firebase Project:
 *    - Truy cập https://console.firebase.google.com
 *    - Tạo project mới
 *    - Vào Realtime Database
 *    - Tạo database (chọn Test mode hoặc Production mode)
 *    - Lấy Database URL (dạng: xxx.firebaseio.com)
 *    - Vào Project Settings > Service accounts > Database secrets
 *    - Copy Database secret key
 * 
 * 3. Cấu hình Firebase Rules (cho phép ghi dữ liệu):
 *    {
 *      "rules": {
 *        "sensors": {
 *          ".read": true,
 *          ".write": true
 *        }
 *      }
 *    }
 * 
 * 4. Điền thông tin:
 *    - WIFI_SSID: Tên WiFi
 *    - WIFI_PASSWORD: Mật khẩu WiFi
 *    - FIREBASE_HOST: Database URL (không có https://)
 *    - FIREBASE_AUTH: Database secret key
 * 
 * 5. Upload code lên ESP8266/NodeMCU
 * 
 * 6. Mở Serial Monitor (115200 baud) để xem log
 */
