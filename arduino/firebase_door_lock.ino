/*
 * ESP01/ESP8266 Firebase Door Lock Control
 * Điều khiển khóa cửa điện tử qua Firebase với bảo mật mật khẩu
 */

#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Cấu hình WiFi
#define WIFI_SSID "TEN_WIFI_CUA_BAN"
#define WIFI_PASSWORD "MAT_KHAU_WIFI"

// Cấu hình Firebase
#define FIREBASE_HOST "nhalinhtinh-56f89-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "DATABASE_SECRET_KEY"

// Cấu hình chân GPIO
#define DOOR_LOCK_PIN 0    // GPIO0 - Điều khiển khóa cửa (relay)
#define LED_PIN 2          // GPIO2 - LED chỉ thị trạng thái

// Firebase objects
FirebaseData firebaseData;

// Trạng thái khóa cửa
bool doorUnlocked = false;
unsigned long lastCheckTime = 0;
const long checkInterval = 500;  // Kiểm tra mỗi 0.5 giây

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== ESP Firebase Door Lock Control ===");
  
  // Cấu hình chân GPIO
  pinMode(DOOR_LOCK_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Khóa cửa ban đầu
  digitalWrite(DOOR_LOCK_PIN, LOW);
  digitalWrite(LED_PIN, HIGH);  // LED sáng = cửa khóa
  
  // Kết nối WiFi
  connectWiFi();
  
  // Khởi tạo Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  
  // Thiết lập buffer
  firebaseData.setBSSLBufferSize(1024, 1024);
  firebaseData.setResponseSize(1024);
  
  // Khởi tạo mật khẩu mặc định nếu chưa có
  initializeDefaultPassword();
  
  Serial.println("Sẵn sàng điều khiển khóa cửa!");
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
    checkDoorControl();
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

// Khởi tạo mật khẩu mặc định
void initializeDefaultPassword() {
  if (Firebase.getString(firebaseData, "/security/doorPassword")) {
    Serial.println("Mật khẩu đã tồn tại");
  } else {
    // Tạo mật khẩu mặc định: 1234
    if (Firebase.setString(firebaseData, "/security/doorPassword", "1234")) {
      Serial.println("Đã tạo mật khẩu mặc định: 1234");
    }
  }
}

// Kiểm tra lệnh điều khiển cửa
void checkDoorControl() {
  if (Firebase.getBool(firebaseData, "/controls/door")) {
    bool newState = firebaseData.boolData();
    
    if (newState != doorUnlocked) {
      doorUnlocked = newState;
      
      if (doorUnlocked) {
        // Mở khóa cửa
        digitalWrite(DOOR_LOCK_PIN, HIGH);
        digitalWrite(LED_PIN, LOW);  // LED tắt = cửa mở
        Serial.println("🔓 Cửa đã MỞ KHÓA");
      } else {
        // Khóa cửa
        digitalWrite(DOOR_LOCK_PIN, LOW);
        digitalWrite(LED_PIN, HIGH);  // LED sáng = cửa khóa
        Serial.println("🔒 Cửa đã KHÓA");
      }
    }
  }
}

/*
 * CẤU TRÚC DỮ LIỆU FIREBASE:
 * 
 * /controls/
 *   {
 *     "door": true/false
 *   }
 * 
 * /security/
 *   {
 *     "doorPassword": "1234"
 *   }
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Web yêu cầu mở khóa bằng cách nhập mật khẩu
 * 2. Web kiểm tra mật khẩu với /security/doorPassword
 * 3. Nếu đúng, web gửi lệnh "door: true" lên Firebase
 * 4. Arduino đọc lệnh và kích hoạt relay mở khóa
 * 5. Sau 5 giây, web tự động gửi lệnh "door: false" để khóa lại
 * 
 * KẾT NỐI PHẦN CỨNG:
 * - GPIO0 -> Relay -> Khóa cửa điện tử
 * - GPIO2 -> LED chỉ thị (tùy chọn)
 * - Relay module cần được cấp nguồn riêng 5V/12V
 * - Khóa cửa điện từ (solenoid lock) hoặc khóa motor
 * 
 * BẢO MẬT:
 * - Mật khẩu được lưu trữ trên Firebase
 * - Web xác thực mật khẩu trước khi gửi lệnh
 * - Arduino chỉ thực thi lệnh, không xác thực mật khẩu
 * - Tự động khóa lại sau 5 giây để đảm bảo an toàn
 * 
 * FIREBASE RULES (cho phép đọc/ghi):
 * {
 *   "rules": {
 *     "controls": {
 *       ".read": true,
 *       ".write": true
 *     },
 *     "security": {
 *       ".read": true,
 *       ".write": true
 *     }
 *   }
 * }
 */
