#include <ESP8266WiFi.h>

const char *ssid = "ADRIAN-IPH";      // Schimbă cu numele rețelei tale
const char *password = "hateclub12a"; // Schimbă cu parola rețelei tale

WiFiServer server(80);
String sensorData = "{}"; // Inițializare JSON gol

void setup()
{
    Serial.begin(19200); // Trebuie să fie la fel ca pe Arduino
    WiFi.begin(ssid, password);

    Serial.print("Conectare la WiFi...");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        // Serial.print(".");
    }

    Serial.println("\nConectat la WiFi!");
    Serial.print("IP ESP-01: ");
    Serial.println(WiFi.localIP()); // Afișează IP-ul ESP-01 în rețea

    server.begin();
    // Serial.println("Server HTTP pornit.");
}

void loop()
{
    WiFiClient client = server.available();
    if (client)
    {
        String request = client.readStringUntil('\r'); // Citire request HTTP
        client.flush();

        // Dacă browserul accesează serverul, trimitem datele JSON
        if (request.indexOf("GET /") >= 0)
        {
            Serial.println("Cerere de date primită!");

            String response = "HTTP/1.1 200 OK\r\n";
            response += "Content-Type: application/json\r\n";
            response += "Connection: close\r\n";
            response += "Content-Length: " + String(sensorData.length()) + "\r\n";
            response += "\r\n";
            response += sensorData;

            client.print(response); // Trimite totul o singură dată
            delay(1);               // Scurtă pauză să ajungă datele
            client.stop();
        }
    }

    // Verificăm dacă primim date noi de la Arduino prin Serial
    if (Serial.available())
    {
        sensorData = Serial.readStringUntil('\n'); // Citire linie completă
        sensorData.trim();                         // Elimină spațiile goale
        Serial.println("Date primite: " + sensorData);
    }
}
