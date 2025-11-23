/*
 * ESP01 Firebase Receiver với WiFi Manager
 * Tự động tạo Access Point để cấu hình WiFi qua web browser
 * Giống như cách điện thoại quét và chọn WiFi
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <FirebaseESP8266.h>

// Cấu hình Firebase
#define FIREBASE_HOST "nhalinhtinh-56f89-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "DATABASE_SECRET_KEY"  // Thay bằng database secret từ Firebase

// Thông tin Access Point của ESP01
#define AP_SSID "ESP01_Setup"
#define AP_PASSWORD "12345678"

// Web server
ESP8266WebServer server(80);

// Firebase objects
FirebaseData firebaseData;

// Biến lưu trữ cấu hình WiFi
struct WiFiConfig {
  char ssid[32];
  char password[64];
  bool configured;
};

WiFiConfig wifiConfig;

// Biến lưu trữ dữ liệu từ Firebase
float temperature = 0;
int gasLevel = 0;
int humidity = 0;
unsigned long lastReadTime = 0;
const long readInterval = 3000;

// Trạng thái kết nối
bool isConfigMode = false;
bool isConnected = false;

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== ESP01 WiFi Manager + Firebase ===");
  
  // Khởi tạo EEPROM để lưu cấu hình
  EEPROM.begin(512);
  
  // Đọc cấu hình WiFi đã lưu
  loadWiFiConfig();
  
  // Nếu chưa cấu hình hoặc không kết nối được, bật chế độ AP
  if (!wifiConfig.configured || !connectToWiFi()) {
    startConfigMode();
  } else {
    startNormalMode();
  }
}

void loop() {
  if (isConfigMode) {
    // Chế độ cấu hình - xử lý web server
    server.handleClient();
  } else {
    // Chế độ hoạt động bình thường
    
    // Kiểm tra kết nối WiFi
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Mất kết nối WiFi! Chuyển sang chế độ cấu hình...");
      startConfigMode();
      return;
    }
    
    // Đọc dữ liệu từ Firebase
    unsigned long currentTime = millis();
    if (currentTime - lastReadTime >= readInterval) {
      lastReadTime = currentTime;
      readDataFromFirebase();
    }
  }
  
  delay(10);
}

// Đọc cấu hình WiFi từ EEPROM
void loadWiFiConfig() {
  EEPROM.get(0, wifiConfig);
  
  if (wifiConfig.configured) {
    Serial.println("Đã tìm thấy cấu hình WiFi:");
    Serial.print("  SSID: ");
    Serial.println(wifiConfig.ssid);
  } else {
    Serial.println("Chưa có cấu hình WiFi");
  }
}

// Lưu cấu hình WiFi vào EEPROM
void saveWiFiConfig() {
  wifiConfig.configured = true;
  EEPROM.put(0, wifiConfig);
  EEPROM.commit();
  Serial.println("✓ Đã lưu cấu hình WiFi");
}

// Xóa cấu hình WiFi
void clearWiFiConfig() {
  wifiConfig.configured = false;
  memset(wifiConfig.ssid, 0, sizeof(wifiConfig.ssid));
  memset(wifiConfig.password, 0, sizeof(wifiConfig.password));
  EEPROM.put(0, wifiConfig);
  EEPROM.commit();
  Serial.println("✓ Đã xóa cấu hình WiFi");
}

// Kết nối vào WiFi đã lưu
bool connectToWiFi() {
  if (!wifiConfig.configured) return false;
  
  Serial.print("Đang kết nối WiFi: ");
  Serial.println(wifiConfig.ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiConfig.ssid, wifiConfig.password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ Đã kết nối WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    isConnected = true;
    return true;
  } else {
    Serial.println("\n✗ Không thể kết nối WiFi!");
    isConnected = false;
    return false;
  }
}

// Bật chế độ cấu hình (Access Point)
void startConfigMode() {
  isConfigMode = true;
  
  Serial.println("\n=== CHẾ ĐỘ CẤU HÌNH ===");
  Serial.println("Đang tạo Access Point...");
  
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
  Serial.println("\nHƯỚNG DẪN CẤU HÌNH:");
  Serial.println("1. Kết nối WiFi điện thoại/laptop vào: " + String(AP_SSID));
  Serial.println("2. Mật khẩu: " + String(AP_PASSWORD));
  Serial.println("3. Mở trình duyệt và truy cập: http://" + IP.toString());
  Serial.println("4. Chọn WiFi và nhập mật khẩu");
  Serial.println("=====================================\n");
  
  // Thiết lập các route cho web server
  server.on("/", HTTP_GET, handleRoot);
  server.on("/scan", HTTP_GET, handleScan);
  server.on("/test", HTTP_POST, handleTest);
  server.on("/save", HTTP_POST, handleSave);
  server.on("/reset", HTTP_GET, handleReset);
  server.onNotFound(handleNotFound);
  
  server.begin();
  Serial.println("Web server đã khởi động!");
}

// Bật chế độ hoạt động bình thường
void startNormalMode() {
  isConfigMode = false;
  
  Serial.println("\n=== CHẾ ĐỘ HOẠT ĐỘNG ===");
  
  // Khởi tạo Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  firebaseData.setBSSLBufferSize(1024, 1024);
  firebaseData.setResponseSize(1024);
  
  Serial.println("Sẵn sàng đọc dữ liệu từ Firebase!");
  Serial.println("Nhấn RESET để vào chế độ cấu hình lại");
  Serial.println("==========================\n");
}

// Xử lý trang chủ
void handleRoot() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta charset='UTF-8'>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
  html += "<title>ESP01 WiFi Setup</title>";
  html += "<style>";
  html += "body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; background: #f5f5f5; }";
  html += "h1 { color: #333; text-align: center; }";
  html += ".container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }";
  html += ".wifi-list { margin: 20px 0; }";
  html += ".wifi-item { padding: 15px; margin: 10px 0; background: #f9f9f9; border-radius: 5px; cursor: pointer; border: 2px solid transparent; }";
  html += ".wifi-item:hover { border-color: #4CAF50; background: #f0f0f0; }";
  html += ".wifi-item.selected { border-color: #4CAF50; background: #e8f5e9; }";
  html += ".signal { float: right; color: #666; }";
  html += "input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }";
  html += "button { width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }";
  html += ".btn-primary { background: #4CAF50; color: white; }";
  html += ".btn-primary:hover { background: #45a049; }";
  html += ".btn-danger { background: #f44336; color: white; }";
  html += ".btn-secondary { background: #2196F3; color: white; }";
  html += ".loading { text-align: center; color: #666; display: none; }";
  html += "</style></head><body>";
  html += "<div class='container'>";
  html += "<h1>🌐 Cấu Hình WiFi</h1>";
  html += "<button class='btn-secondary' onclick='scanWiFi()'>🔍 Quét WiFi</button>";
  html += "<div class='loading' id='loading'>Đang quét...</div>";
  html += "<div class='wifi-list' id='wifi-list'></div>";
  html += "<div id='config-form' style='display:none;'>";
  html += "<h3>Kết nối: <span id='selected-ssid'></span></h3>";
  html += "<input type='password' id='password' placeholder='Nhập mật khẩu WiFi'>";
  html += "<div id='test-result' style='margin:10px 0; padding:10px; border-radius:5px; display:none;'></div>";
  html += "<button class='btn-secondary' onclick='testConnection()'>🔌 Test Kết Nối</button>";
  html += "<button class='btn-primary' onclick='saveConfig()'>💾 Lưu và Kết Nối</button>";
  html += "</div>";
  html += "<button class='btn-danger' onclick='resetConfig()'>🔄 Xóa Cấu Hình</button>";
  html += "</div>";
  
  html += "<script>";
  html += "let selectedSSID = '';";
  html += "function scanWiFi() {";
  html += "  document.getElementById('loading').style.display = 'block';";
  html += "  fetch('/scan').then(r => r.json()).then(data => {";
  html += "    document.getElementById('loading').style.display = 'none';";
  html += "    let html = '';";
  html += "    data.networks.forEach(net => {";
  html += "      let signal = '📶'.repeat(Math.ceil(net.rssi / 25));";
  html += "      html += '<div class=\"wifi-item\" onclick=\"selectWiFi(\\'' + net.ssid + '\\')\"><strong>' + net.ssid + '</strong><span class=\"signal\">' + signal + '</span></div>';";
  html += "    });";
  html += "    document.getElementById('wifi-list').innerHTML = html;";
  html += "  });";
  html += "}";
  html += "function selectWiFi(ssid) {";
  html += "  selectedSSID = ssid;";
  html += "  document.querySelectorAll('.wifi-item').forEach(el => el.classList.remove('selected'));";
  html += "  event.target.closest('.wifi-item').classList.add('selected');";
  html += "  document.getElementById('selected-ssid').textContent = ssid;";
  html += "  document.getElementById('config-form').style.display = 'block';";
  html += "}";
  html += "function testConnection() {";
  html += "  const password = document.getElementById('password').value;";
  html += "  const result = document.getElementById('test-result');";
  html += "  if (!selectedSSID) { alert('Vui lòng chọn WiFi!'); return; }";
  html += "  result.style.display = 'block';";
  html += "  result.style.background = '#fff3cd';";
  html += "  result.style.color = '#856404';";
  html += "  result.textContent = '⏳ Đang test kết nối...';";
  html += "  fetch('/test', { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'},";
  html += "    body: 'ssid=' + encodeURIComponent(selectedSSID) + '&password=' + encodeURIComponent(password)";
  html += "  }).then(r => r.json()).then(data => {";
  html += "    if (data.success) {";
  html += "      result.style.background = '#d4edda';";
  html += "      result.style.color = '#155724';";
  html += "      result.textContent = '✓ ' + data.message;";
  html += "    } else {";
  html += "      result.style.background = '#f8d7da';";
  html += "      result.style.color = '#721c24';";
  html += "      result.textContent = '✗ ' + data.message;";
  html += "    }";
  html += "  }).catch(err => {";
  html += "    result.style.background = '#f8d7da';";
  html += "    result.style.color = '#721c24';";
  html += "    result.textContent = '✗ Lỗi kết nối';";
  html += "  });";
  html += "}";
  html += "function saveConfig() {";
  html += "  const password = document.getElementById('password').value;";
  html += "  if (!selectedSSID) { alert('Vui lòng chọn WiFi!'); return; }";
  html += "  fetch('/save', { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'},";
  html += "    body: 'ssid=' + encodeURIComponent(selectedSSID) + '&password=' + encodeURIComponent(password)";
  html += "  }).then(r => r.text()).then(msg => { alert(msg); });";
  html += "}";
  html += "function resetConfig() {";
  html += "  if (confirm('Xóa cấu hình WiFi?')) {";
  html += "    fetch('/reset').then(r => r.text()).then(msg => { alert(msg); location.reload(); });";
  html += "  }";
  html += "}";
  html += "scanWiFi();";  // Auto scan on load
  html += "</script>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

// Quét WiFi xung quanh
void handleScan() {
  Serial.println("Đang quét WiFi...");
  
  int n = WiFi.scanNetworks();
  String json = "{\"networks\":[";
  
  for (int i = 0; i < n; i++) {
    if (i > 0) json += ",";
    json += "{\"ssid\":\"" + WiFi.SSID(i) + "\",";
    json += "\"rssi\":" + String(WiFi.RSSI(i)) + ",";
    json += "\"encryption\":" + String(WiFi.encryptionType(i)) + "}";
  }
  
  json += "]}";
  
  Serial.println("Tìm thấy " + String(n) + " mạng WiFi");
  server.send(200, "application/json", json);
}

// Test kết nối WiFi và Firebase
void handleTest() {
  if (server.hasArg("ssid") && server.hasArg("password")) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    
    Serial.println("\n=== TEST KẾT NỐI ===");
    Serial.print("SSID: ");
    Serial.println(ssid);
    
    // Ngắt kết nối hiện tại
    WiFi.disconnect();
    delay(100);
    
    // Thử kết nối WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid.c_str(), password.c_str());
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    String json = "{";
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n✓ WiFi kết nối thành công!");
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
      
      // Test Firebase connection
      FirebaseData testData;
      Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
      
      bool firebaseOk = false;
      if (Firebase.getFloat(testData, "/sensors/current/temperature")) {
        float temp = testData.floatData();
        Serial.printf("✓ Firebase OK! Nhiệt độ: %.1f°C\n", temp);
        firebaseOk = true;
        json += "\"success\":true,";
        json += "\"message\":\"WiFi và Firebase kết nối thành công! Nhiệt độ: " + String(temp, 1) + "°C\"";
      } else {
        Serial.println("✗ Không đọc được Firebase!");
        Serial.println("Lỗi: " + testData.errorReason());
        json += "\"success\":false,";
        json += "\"message\":\"WiFi OK nhưng không kết nối được Firebase\"";
      }
      
      // Ngắt kết nối test
      WiFi.disconnect();
    } else {
      Serial.println("\n✗ Không kết nối được WiFi!");
      json += "\"success\":false,";
      json += "\"message\":\"Không kết nối được WiFi. Kiểm tra lại mật khẩu!\"";
    }
    
    json += "}";
    
    // Quay lại chế độ AP
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASSWORD);
    
    Serial.println("===================\n");
    server.send(200, "application/json", json);
  } else {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"Thiếu thông tin!\"}");
  }
}

// Lưu cấu hình WiFi
void handleSave() {
  if (server.hasArg("ssid") && server.hasArg("password")) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");
    
    // Lưu vào struct
    ssid.toCharArray(wifiConfig.ssid, sizeof(wifiConfig.ssid));
    password.toCharArray(wifiConfig.password, sizeof(wifiConfig.password));
    
    saveWiFiConfig();
    
    server.send(200, "text/plain", "✓ Đã lưu! ESP01 sẽ khởi động lại và kết nối...");
    
    delay(2000);
    ESP.restart();
  } else {
    server.send(400, "text/plain", "✗ Thiếu thông tin!");
  }
}

// Xóa cấu hình
void handleReset() {
  clearWiFiConfig();
  server.send(200, "text/plain", "✓ Đã xóa cấu hình! ESP01 sẽ khởi động lại...");
  delay(2000);
  ESP.restart();
}

// Xử lý 404
void handleNotFound() {
  server.send(404, "text/plain", "Not Found");
}

// Đọc dữ liệu từ Firebase
void readDataFromFirebase() {
  // Đọc nhiệt độ
  if (Firebase.getFloat(firebaseData, "/sensors/current/temperature")) {
    temperature = firebaseData.floatData();
    Serial.printf("Nhiệt độ: %.1f°C\n", temperature);
  }
  
  // Đọc khí gas
  if (Firebase.getInt(firebaseData, "/sensors/current/gasLevel")) {
    gasLevel = firebaseData.intData();
    Serial.printf("Khí gas: %d ppm\n", gasLevel);
  }
  
  // Đọc độ ẩm
  if (Firebase.getInt(firebaseData, "/sensors/current/humidity")) {
    humidity = firebaseData.intData();
    Serial.printf("Độ ẩm: %d%%\n", humidity);
  }
}

/*
 * HƯỚNG DẪN SỬ DỤNG:
 * 
 * 1. Cài đặt thư viện:
 *    - Firebase ESP8266 Client by Mobizt
 * 
 * 2. Upload code lên ESP01
 * 
 * 3. Lần đầu khởi động:
 *    - ESP01 sẽ tạo WiFi: "ESP01_Setup" (mật khẩu: 12345678)
 *    - Dùng điện thoại/laptop kết nối vào WiFi này
 *    - Mở trình duyệt, truy cập: http://192.168.4.1
 *    - Chọn WiFi từ danh sách (giống điện thoại)
 *    - Nhập mật khẩu và lưu
 * 
 * 4. ESP01 sẽ tự động:
 *    - Khởi động lại
 *    - Kết nối vào WiFi đã chọn
 *    - Đọc dữ liệu từ Firebase
 * 
 * 5. Để cấu hình lại:
 *    - Nhấn nút RESET trên web interface
 *    - Hoặc nhấn nút Reset vật lý trên ESP01
 * 
 * LƯU Ý:
 * - Nhớ thay FIREBASE_AUTH bằng database secret của bạn
 * - Cấu hình WiFi được lưu vào EEPROM (không mất khi tắt nguồn)
 * - ESP01 cần nguồn 3.3V ổn định
 */
