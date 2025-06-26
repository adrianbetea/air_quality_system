#define MQ2_PIN A0
#define MQ5_PIN A1
#define MQ135_PIN A2
#define RL 10.0                // Load resistance în kΩ
#define CALIBRATION_SAMPLES 50 // Număr de citiri pentru calibrare

float calibrateSensor(int pin, float air_ratio)
{
    float Vout = 0.0;
    for (int i = 0; i < CALIBRATION_SAMPLES; i++)
    {
        Vout += analogRead(pin);
        delay(50);
    }
    Vout = (Vout / CALIBRATION_SAMPLES) * (5.0 / 1023.0); // Convertire la voltaj
    float Rs = RL * ((5.0 - Vout) / Vout);
    return Rs / air_ratio; // R0 = Rs / (Rs/R0 în aer din datasheet)
}

float getRsRo(int pin, float R0)
{
    float Vout = analogRead(pin) * (5.0 / 1023.0);
    float Rs = (10.0 * (5.0 - Vout)) / Vout; // RL = 10kΩ
    return Rs / R0;
}

void setup()
{
    Serial.begin(9600);
    delay(2000);

    float MQ2_R0 = calibrateSensor(MQ2_PIN, 9.83);    // Valoare tipică Rs/R0 în aer pentru MQ2
    float MQ5_R0 = calibrateSensor(MQ5_PIN, 6.5);     // Valoare tipică Rs/R0 în aer pentru MQ5
    float MQ135_R0 = calibrateSensor(MQ135_PIN, 3.6); // Valoare tipică Rs/R0 în aer pentru MQ135

    Serial.println(MQ2_R0);
    Serial.println(MQ5_R0);
    Serial.println(MQ135_R0);
}

void loop()
{
}
