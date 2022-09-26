#include <SPI.h>
#include <Wire.h>
#include <WiFi.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <ArduinoJson.h>
#include "HTTPClient.h"
#include "secrets.h"
#include "ThingSpeak.h" 

// code definitions
#define LED_PIN 18 // FLOW LED
#define SENSOR 27
#define CAP (int)1e8
#define SEND_INTERVAL 120000 // FlowData sent to cloud every 2 min
#define DISPLAY_INTERVAL 1000 // flowRateSend updated on OLED every sec
#define CALIBRATION_FACTOR 3.9 // Calculated calibration factor
#define FLOW_THRESHOLD 1.0 // Threshold flowRateSend for LED in L/min
#define P1 1721 //RSA encryption prime1
#define P2 4999 //RSA encryption prime2

// initializing with I2C address
#define i2c_Address 0x3c // OLED
#define SCREEN_WIDTH 128 // OLED display width in pixels
#define SCREEN_HEIGHT 64 // OLED display height in pixels
#define OLED_RESET -1    // QT-PY / XIAO
Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// variables declaration and initialization for water flow sensor
long previousMillisSend, previousMillisDisplay;
volatile int pulseCount;
int currDisplay, currSend, prevDisplay, prevSend;
float flowRateSend, flowRateDisplay;
unsigned int flowMLSend, flowMLDisplay;
long E; //RSA encryption

char ssid[] = SECRET_SSID; // your network SSID (name)
char pass[] = SECRET_PASS; // your network password
int keyIndex = 0;          // your network key Index number (needed only for WEP)
WiFiClient client;

unsigned long myChannelNumber = SECRET_CH_ID;    // ThingSpeak Channel Number
const char *myWriteAPIKey = SECRET_WRITE_APIKEY; // APIKEY for writing to myChannelNumber

unsigned long myOtherChannelNumber = CH_ID;    // ThingSpeak Channel Number
const char *myOtherWriteAPIKey = WRITE_APIKEY; // APIKEY for writing to myChannelNumber

float waterFlow = 0.0;
String EncryptedWaterFlow;
float volume = 0.0;
String myStatus = "";

// String cse_ip = "192.168.140.155";
// String cse_port = "8080";
// String server = "http://" + cse_ip + ":" + cse_port + "/~/in-cse/in-name/";
// String ae = "WaterLevel_sensor";
// String cnt = "node1";

//String server = "https://esw-onem2m.iiit.ac.in/~/in-cse/in-name/"; // outside network
String server = "http://esw-onem2m.iiit.ac.in:443/~/in-cse/in-name/";  //IIIT network
String ae = "Team-7";
String cnt;

void IRAM_ATTR pulseCounter()
{
  pulseCount = (pulseCount + 1) % CAP;
}

void createCI(String &val, String &cnt)
{
  HTTPClient http;
  http.begin(server + ae + "/" + cnt + "/");
  //http.addHeader("X-M2M-Origin", "admin:admin"); //localhost
  http.addHeader("X-M2M-Origin", SECRET_OM2M_ID); // for iiit server
  http.addHeader("Content-Type", "application/json;ty=4");
  int code = http.POST("{\"m2m:cin\": {\"cnf\":\"application/json\",\"con\": " + String(val) + "}}");
  Serial.print(cnt + " code : ");
  Serial.println(code);
  if (code == -1)
  {
    Serial.println("UNABLE TO CONNECT TO THE SERVER");
  }
  http.end();
}

//RSA ENCRYPTION---------------------------------------------
long gcd(long a, long h){
    long temp;
    while (true){
        temp = a%h;
        if (temp == 0){
          return h;
        }
        a = h;
        h = temp;
    }
}

long addmod(long x, long y, long n)
{
    // Precondition: x<n, y<n
    // If it will overflow, use alternative calculation
    if (x + y <= x) x = x - (n - y) % n;
    else x = (x + y) % n;
    return x;
}

long sqrmod(long a, long n)
{
    long b;
    long sum = 0;

    // Make sure original number is less than n
    a = a % n;

    // Use double and add algorithm to calculate a*a mod n
    for (b = a; b != 0; b >>= 1) {
        if (b & 1) {
            sum = addmod(sum, a, n);
        }
        a = addmod(a, a, n);
    }
    return sum;
}

long powFun(long base, long ex, long mo) {
    long r;
    if(ex == 0) 
        return 1;
    else if(ex % 2 == 0) {
        r = powFun(base, ex/2, mo) % mo ;
        // return (r * r) % mo;
        return sqrmod(r, mo);
    }else 
        return (base * powFun(base, ex - 1, mo)) % mo;
}

long getE(long p1, long p2){
    long e = 3;
    long phi = (p1-1)*(p2-1);
    while (e < phi){
        if (gcd(e, phi)==1)
            break;
        else
            e+=1;
    }
    return e;
}
long Encrypt(long val, long p1, long p2, long e){
    long n = p1*p2;
    return powFun(val, e, n);
}
//-----------------------------------------------------------------

void setup()
{
  Serial.begin(9600);

  E = getE(P1, P2);
  
  pinMode(LED_PIN, OUTPUT); //LED
  pinMode(SENSOR, INPUT_PULLUP);
  digitalWrite(LED_PIN, LOW);

  pulseCount = 0;
  flowRateSend = 0.0;
  flowRateDisplay = 0.0;
  flowMLSend = 0;
  flowMLDisplay = 0;
  previousMillisSend = millis();
  previousMillisDisplay = millis();
  prevDisplay = 0.0;
  currDisplay = 0.0;
  prevSend = 0.0;
  currSend = 0.0;

  attachInterrupt(digitalPinToInterrupt(SENSOR), pulseCounter, FALLING);

  delay(250); // waiting for OLED to power up
  display.begin(i2c_Address, true);
  display.setContrast(0); // dim display
  display.display();
  delay(2000);

  // Clear the buffer.
  display.clearDisplay();

  while (!Serial)
  {
    ;
    // wait for serial port to connect.
    // needed for Leonardo native USB port only
  }

  WiFi.mode(WIFI_STA);
  ThingSpeak.begin(client); // initialize ThingSpeak
  delay(250);
}

void loop()
{

  if (millis() - previousMillisDisplay > DISPLAY_INTERVAL) {
    currDisplay = pulseCount  - prevDisplay;
    if (currDisplay < 0) currDisplay += CAP;
    prevDisplay = pulseCount;
    flowRateDisplay = ((1000.0 / (millis() - previousMillisDisplay)) * currDisplay) / CALIBRATION_FACTOR;
    previousMillisDisplay = millis();
    // Divide the flow rate in litres/minute by 60 to determine how many litres have
    // passed through the sensor in this 1 second interval, then multiply by 1000 to
    // convert to millilitres.
    flowMLDisplay = (flowRateDisplay / 60) * 1000; // mL/sec
    
    // Print the flow rate for this second
    Serial.print("DISPLAY::::Flow rate: ");
    Serial.print(int(flowMLDisplay)); // Print the integer part of the variable
    Serial.print("mL/sec or ");
    Serial.print(flowRateDisplay);
    Serial.println("L/min");

    // print on oled
    display.setTextSize(1);
    display.setTextColor(SH110X_WHITE);
    display.setCursor(0, 0);
    display.println("Flow rate");
    display.println();
    display.setTextSize(4);
    display.println(flowRateDisplay);
    display.setTextSize(2);
    display.println("L/min");
    display.display();
    display.clearDisplay();

    if (flowRateDisplay > FLOW_THRESHOLD) digitalWrite(LED_PIN, HIGH); // flow LED ON
    else digitalWrite(LED_PIN, LOW); // flow LED OFF
  }

  // Check wifi status for cloud communication

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(SECRET_SSID);
    int c = 0;
    while (WiFi.status() != WL_CONNECTED && c++ < 3) // if not connected try connecting 3 times or move on
    {
      WiFi.begin(ssid, pass); // connect to WPA/WPA2 network
      Serial.print(".");
      delay(5000);
    }
    Serial.println("\nConnected.");
  }
  else {
    if (millis() - previousMillisSend > SEND_INTERVAL)
    {
      currSend = pulseCount  - prevSend;
      if (currSend < 0) currSend += CAP;
      prevSend = pulseCount;

      // Because this loop may not complete in exactly 2min intervals we calculate
      // the number of milliseconds that have passed since the last execution and use
      // that to scale the output. We also apply the calibrationFactor to scale the output
      // based on the number of pulses per second per units of measure (litres/minute in
      // this case) coming from the sensor.
      flowRateSend = ((1000.0 / (millis() - previousMillisSend)) * currSend) / CALIBRATION_FACTOR; // L/min
      previousMillisSend = millis();

      // Divide the flow rate in litres/minute by 60 to determine how many litres have
      // passed through the sensor in this 1 second interval, then multiply by 1000 to
      // convert to millilitres.

      flowMLSend = (flowRateSend / 60) * 1000; // mL/sec

      Serial.print("SEND::::Flow rate: ");
      Serial.print(int(flowMLSend)); // Print the integer part of the variable
      Serial.print("mL/sec or ");
      Serial.print(flowRateSend);
      Serial.println("L/min");
      waterFlow = int(flowMLSend);
      EncryptedWaterFlow = String(Encrypt(waterFlow, P1, P2, E));
      String val = String(waterFlow);
      cnt = "flowRate";
      createCI(val, cnt);

      // set the fields with the values
      ThingSpeak.setField(1, EncryptedWaterFlow); // field1 = waterFlow
      int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
      if (x == 200)
      {
        Serial.print("Channel update successful, sent ");
        Serial.println(EncryptedWaterFlow);
      }
      else
      {
        Serial.println("Problem updating channel. HTTP error code " + String(x));
      }
      ThingSpeak.setField(1, waterFlow);
      int y = ThingSpeak.writeFields(myOtherChannelNumber, myOtherWriteAPIKey);
    }
  }
}
