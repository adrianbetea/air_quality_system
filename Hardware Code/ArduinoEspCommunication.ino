#include <SoftwareSerial.h>
#include <dht.h>

#define MQ2_PIN A0
#define MQ5_PIN A1
#define MQ135_PIN A2
#define GPY2_PIN A3
#define DHT11_PIN 4
#define STATUS_LED_PIN 10

#define LED_POWER 7

#define RL 10.0 // Load resistance kOhms
// MQ2 values
#define MQ2_R0 17.32
#define MQ2_a 200
#define MQ2_b -1.5
// MQ5
#define MQ5_R0 36.81
#define MQ5_a 600
#define MQ5_b -1.3
// MQ135
#define MQ135_R0 74.0
#define MQ135_a 110.0
#define MQ135_b -2.85

SoftwareSerial EspSerial(2, 3); // RX, TX

// Your ESP8266 baud rate:
#define ESP8266_BAUD 19200

dht DHT;
// DHT11 variables
int samplingTime = 280;
int deltaTime = 40;
int sleepTime = 9680;
float vo_measured = 0;
float calc_voltage = 0;
float dust_density = 0;
float temperature = 0;
float humidity = 0;

// MQ2 gas concentration
float mq2_gas_concentration;
// MQ5 gas concentration
float mq5_gas_concentration;
// MQ135 gas concentration
float mq135_gas_concentration;

String data = "";

void setup()
{
    Serial.begin(19200);
    pinMode(LED_POWER, OUTPUT);
    pinMode(STATUS_LED_PIN, OUTPUT);

    // Set ESP8266 baud rate
    EspSerial.begin(ESP8266_BAUD); // comunicarea cu ESP
}

void loop()
{
    digitalWrite(STATUS_LED_PIN, HIGH);
    MQ2_gas_sensor();
    MQ5_gas_sensor();
    MQ135_gas_sensor();
    GPY2_particle_sensor();
    DHT11_temperature_humidity_sensor();

    if (!isnan(mq2_gas_concentration))
    {
        data = "{\"MQ2\":" + String(mq2_gas_concentration);
        if (!isnan(mq5_gas_concentration))
        {
            data = data + ", \"MQ5\": " + String(mq5_gas_concentration);
        }
        if (!isnan(mq135_gas_concentration))
        {
            data = data + ", \"MQ135\": " + String(mq135_gas_concentration);
        }
        if (!isnan(dust_density))
        {
            data = data + ", \"DustDensity\": " + String(dust_density);
        }
        if (!isnan(temperature))
        {
            data = data + ", \"Temperature\": " + String(temperature);
        }
        if (!isnan(humidity))
        {
            data = data + ", \"Humidity\": " + String(humidity);
        }
        data = data + "}";
        EspSerial.print(data);
        EspSerial.print('\n');
        // Serial.println(data);
    }
    delay(200);
    digitalWrite(STATUS_LED_PIN, LOW);
    while (EspSerial.available())
    {
        String response = EspSerial.readStringUntil('\n');
        response.trim();
    }
    delay(3800); // 4 secunde delay + 1s de la citiri
}

void MQ2_gas_sensor()
{
    uint16_t mq2_sensor_val = analogRead(MQ2_PIN);
    // Calculate gas concentration
    float voltage = mq2_sensor_val * (5.0 / 1023.0); // Convert analog value to voltage (0-5V)

    mq2_gas_concentration = GasSensor_get_PPM(voltage, MQ2_R0, MQ2_a, MQ2_b);

    // Serial.print("MQ2 (PPM): ");
    // Serial.println(mq2_gas_concentration);

    delay(100);
}

void MQ5_gas_sensor()
{
    uint16_t mq5_sensor_val = analogRead(MQ5_PIN);
    // Calculate gas concentration
    float voltage = mq5_sensor_val * (5.0 / 1023.0); // Convert analog value to voltage (0-5V)

    mq5_gas_concentration = GasSensor_get_PPM(voltage, MQ5_R0, MQ2_a, MQ5_b);

    // Serial.print("MQ5 (PPM): ");
    // Serial.println(mq5_gas_concentration);
    delay(100);
}

void MQ135_gas_sensor()
{
    uint16_t mq135_sensor_val = analogRead(MQ135_PIN);
    float voltage = mq135_sensor_val * (5.0 / 1023.0); // Convertim analogic -> voltaj

    float Rs = RL * ((5.0 - voltage) / voltage);
    float ratio = Rs / MQ135_R0; // Rs/R0

    mq135_gas_concentration = GasSensor_get_PPM(voltage, MQ135_R0, MQ135_a, MQ135_b);

    // Serial.print("MQ135 (PPM): ");
    // Serial.println(mq135_gas_concentration);
    delay(100);
}

void GPY2_particle_sensor()
{
    digitalWrite(LED_POWER, LOW);
    delayMicroseconds(samplingTime);
    vo_measured = analogRead(GPY2_PIN);
    delayMicroseconds(deltaTime);
    digitalWrite(LED_POWER, HIGH);
    delayMicroseconds(sleepTime);

    calc_voltage = vo_measured * (5.0 / 1024.0);
    dust_density = 170 * calc_voltage - 0.1;
    delay(100);
}

void DHT11_temperature_humidity_sensor()
{
    DHT.read11(DHT11_PIN);
    temperature = DHT.temperature;
    humidity = DHT.humidity;

    // Serial.print("Temperature = ");
    // Serial.println(temperature);
    // Serial.print("Humidity = ");
    // Serial.println(humidity);
    delay(500);
}

float GasSensor_get_PPM(float voltage, float R0, float a, float b)
{
    float Rs = RL * ((5.0 - voltage) / voltage);
    float ratio = Rs / R0;

    float ppm = a * pow(ratio, b); // gas concentration in parts per million (PPM)

    return ppm;
}
