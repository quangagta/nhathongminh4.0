/*
 * ESP01/ESP8266 Firebase Control Receiver
 * Nhận lệnh điều khiển từ Firebase và điều khiển thiết bị
 * Web gửi lệnh lên Firebase -> Arduino đọc và thực thi
 */

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Cấu hình WiFi
#define WIFI_SSID "TEN_WIFI_CUA_BAN"
#define WIFI_PASSWORD "MAT_KHAU_WIFI"

// Cấu hình Firebase
#define FIREBASE_HOST "nhalinhtinh-56f89-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "DATABASE_SECRET_KEY"

// Cấu hình chân GPIO cho thiết bị
#define LIGHT1_PIN 0    // GPIO0 - Đèn 1
#define LIGHT2_PIN 2    // GPIO2 - Đèn 2 
#define FAN_PIN 4       // GPIO4 (D2) - Quạt (nếu dùng NodeMCU)
#define PUMP_PIN 5      // GPIO5 (D1) - Bơm nước (nếu dùng NodeMCU)

// Firebase objects
FirebaseData firebaseData;

// Trạng thái thiết bị
bool light1State = false;
bool light2State = false;
bool fanState = false;
bool pumpState = false;

// Thời gian kiểm tra lệnh
unsigned long lastCheckTime = 0;
const long checkInterval = 1000;  // Kiểm tra mỗi 1 giây

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== ESP Firebase Control Receiver ===");
  
  // Cấu hình chân GPIO
  pinMode(LIGHT1_PIN, OUTPUT);
  pinMode(LIGHT2_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  
  // Tắt tất cả thiết bị ban đầu
  digitalWrite(LIGHT1_PIN, LOW);
  digitalWrite(LIGHT2_PIN, LOW);
  digitalWrite(FAN_PIN, LOW);
  digitalWrite(PUMP_PIN, LOW);
  
  // Kết nối WiFi
  connectWiFi();
  
  // Khởi tạo Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  
  // Thiết lập buffer
  firebaseData.setBSSLBufferSize(1024, 1024);
  firebaseData.setResponseSize(1024);
  
  Serial.println("Sẵn sàng nhận lệnh điều khiển từ Firebase!");
  Serial.println("---");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Kiểm tra kết nối WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Mất kết nối WiFi! Đang kết nối lại...");
    connectWiFi();
  }
  
  // Đọc lệnh điều khiển từ Firebase
  if (currentTime - lastCheckTime >= checkInterval) {
    lastCheckTime = currentTime;
    readControlCommands();
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
  } else {
    Serial.println();
    Serial.println("✗ Không thể kết nối WiFi!");
  }
}

// Hàm đọc lệnh điều khiển từ Firebase
void readControlCommands() {
  // Đọc lệnh điều khiển đèn 1
  if (Firebase.getBool(firebaseData, "/controls/light1")) {
    bool newState = firebaseData.boolData();
    if (newState != light1State) {
      light1State = newState;
      digitalWrite(LIGHT1_PIN, light1State ? HIGH : LOW);
      Serial.printf("Đèn 1: %s\n", light1State ? "BẬT" : "TẮT");
    }
  }
  
  // Đọc lệnh điều khiển đèn 2
  if (Firebase.getBool(firebaseData, "/controls/light2")) {
    bool newState = firebaseData.boolData();
    if (newState != light2State) {
      light2State = newState;
      digitalWrite(LIGHT2_PIN, light2State ? HIGH : LOW);
      Serial.printf("Đèn 2: %s\n", light2State ? "BẬT" : "TẮT");
    }
  }
  
  // Đọc lệnh điều khiển quạt
  if (Firebase.getBool(firebaseData, "/controls/fan")) {
    bool newState = firebaseData.boolData();
    if (newState != fanState) {
      fanState = newState;
      digitalWrite(FAN_PIN, fanState ? HIGH : LOW);
      Serial.printf("Quạt: %s\n", fanState ? "BẬT" : "TẮT");
    }
  }
  
  // Đọc lệnh điều khiển bơm nước
  if (Firebase.getBool(firebaseData, "/controls/pump")) {
    bool newState = firebaseData.boolData();
    if (newState != pumpState) {
      pumpState = newState;
      digitalWrite(PUMP_PIN, pumpState ? HIGH : LOW);
      Serial.printf("Bơm nước: %s\n", pumpState ? "BẬT" : "TẮT");
    }
  }
}

/*
 * CẤU TRÚC DỮ LIỆU FIREBASE:
 * 
 * /controls/
 *   {
 *     "light1": true/false,
 *     "light2": true/false,
 *     "fan": true/false,
 *     "pump": true/false
 *   }
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Web gửi lệnh điều khiển lên Firebase (ví dụ: light1: true)
 * 2. Arduino đọc giá trị từ Firebase mỗi giây
 * 3. Nếu phát hiện thay đổi, Arduino thực thi lệnh (bật/tắt thiết bị)
 * 4. In thông báo ra Serial Monitor
 * 
 * LƯU Ý:
 * - Đối với ESP-01: Chỉ có GPIO0 và GPIO2 khả dụng
 * - Đối với NodeMCU: Có nhiều GPIO hơn (D1, D2, D3, D4,...)
 * - Điều chỉnh số chân GPIO phù hợp với phần cứng của bạn
 * - Có thể cần module relay để điều khiển thiết bị công suất lớn
 * 
 * FIREBASE RULES (phải cho phép đọc/ghi):
 * {
 *   "rules": {
 *     "controls": {
 *       ".read": true,
 *       ".write": true
 *     }
 *   }
 * }
 */
