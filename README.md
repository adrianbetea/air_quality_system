# Air Quality System

## Technologies Used
 * Frontend: React Native (with Expo Go)
* Backend: Node.js(Express and Axios)
* Hardware: Arduino + ESP8266-01
* Sensors: MQ2, MQ5, MQ135, GP2Y1010AU01, DHT11
* Database: MySQL

## Clone the project

In a terminal run the following command

```bash
git clone https://github.com/adrianbetea/air_quality_system.git
```

## Installation
Change directory to air_quality_system

```bash
cd air_quality_system
```
### Make sure you have Node.js installed and npm before installing all node dependencies 
Install Expo Go

```bash
npm install -g expo-cli
```
Install node dependencies using the following command

```bash
npm install 
```

## env.js file
Add an env.js file where you add the following:

* BASE_URL - usually your ip addres in a "http://192.x.x.x:3000" format
* SERVER_URL - the server url available from the ESP Wi-Fi module
* MAILTRAP_API
* TWILIO_SID
* TWILIO_AUTH_TOKEN
*TWILIO_MSG_SERVICE

## Database

The database schema is available in the database directory in the database_schema.txt file, there you can find all database tables and the SQL code to create them.
..
## Usage

Two terminals are needed to run the application, for backend and frontend

Backend 
```bash
cd backend
nodemon server.js
```

Frontend

From the initial directory air_quality_system run the following command

```bash
npx expo start
```
Make sure you have installed Expo Go on your device and scan the QR code to see app
