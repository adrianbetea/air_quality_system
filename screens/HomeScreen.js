import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
const env = require("./../env.js");
const BASE_URL = env.BASE_URL;
const SERVER_URL = env.SERVER_URL;

export default function HomeScreen() {
  const [status, setStatus] = useState("Disconnected");
  const [sensorDataNow, setSensorDataNow] = useState({
    MQ2: "",
    MQ5: "",
    MQ135: "",
    DustDensity: "",
    Temperature: "",
    Humidity: "",
  });
  const [airQuality, setAirQuality] = useState("CHECKING");
  const [sensorDataTimestamp, setSensorDataTimestamp] = useState("CHECKING");
  const [lastUpdateAgo, setLastUpdateAgo] = useState("");
  const [sensorDataHistory, setSensorDataHistory] = useState({
    MQ2: [0],
    MQ5: [0],
    MQ135: [0],
    DustDensity: [0],
    Temperature: [0],
    Humidity: [0],
    Timestamp: [0],
  });

  const [chartData, setChartData] = useState({
    labels: [0],
    datasets: [{ data: [0] }],
    legend: [""], // optional
  });

  const [selectedSensor, setSelectedSensor] = useState(false);

  const onPressSetChartData = (
    paramTimestamp,
    paramSensorData,
    paramLegend
  ) => {
    setChartData({
      labels: paramTimestamp,
      datasets: [
        {
          data: paramSensorData.map((value) => Number(value)),
          color: (opacity = 1) => `rgba(100, 207, 219, ${opacity})`,
        },
      ],
      legend: [paramLegend],
    });

    console.log("SensorDataHistory", paramSensorData);
  };

  const [isChartInitialized, setIsChartInitialized] = useState(false);

  useEffect(() => {
    if (!isChartInitialized && sensorDataHistory.Timestamp.length > 0) {
      onPressSetChartData(
        sensorDataHistory.Timestamp,
        sensorDataHistory.MQ2,
        "MQ2 ppm"
      );
      setIsChartInitialized(true);
    }
  }, [sensorDataHistory, isChartInitialized]);

  const navigation = useNavigation();

  const calculateAirQuality = (data) => {
    let score = -1;

    if (data.MQ2 <= 100) score += 2;
    else if (data.MQ2 <= 200) score += 1;

    if (data.MQ5 <= 100) score += 2;
    else if (data.MQ5 <= 200) score += 1;

    if (data.MQ135 <= 100) score += 2;
    else if (data.MQ135 <= 200) score += 1;

    if (data.DustDensity <= 100) score += 2;
    else if (data.DustDensity <= 200) score += 1;

    console.log("SCORE = ", score);
    if (score + 1 >= 7) return "EXCELLENT";
    else if (score + 1 >= 5) return "GOOD";
    else if (score + 1 >= 3) return "OK";
    else if (score + 1 < 3 && score >= 0) return "BAD";
    else if (score === -1) return "CHECKING";
  };
  useEffect(() => {
    const fetchLastRecordsSensorData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/sensor//fetch-ordered-data/from-database`
        );
        const data = response.data;

        const MQ2 = data.map((item) => item.MQ2);
        const MQ5 = data.map((item) => item.MQ5);
        const MQ135 = data.map((item) => item.MQ135);
        const DustDensity = data.map((item) => item.DustDensity);
        const Temperature = data.map((item) => item.Temperature);
        const Humidity = data.map((item) => item.Humidity);
        const Timestamp = data.map((item) => {
          if (!item.Timestamp) return "??:??";

          const date = new Date(item.Timestamp);
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        });

        const newHistory = {
          MQ2,
          MQ5,
          MQ135,
          DustDensity,
          Temperature,
          Humidity,
          Timestamp,
        };

        setSensorDataHistory({
          MQ2,
          MQ5,
          MQ135,
          DustDensity,
          Temperature,
          Humidity,
          Timestamp,
        });

        if (!isChartInitialized && sensorDataHistory.Timestamp.length > 0) {
          onPressSetChartData(Timestamp, MQ2, "MQ2 ppm");
          setIsChartInitialized(true);
        }
      } catch (error) {
        console.error("Eroare la preluarea datelor", error);
      }
    };
    fetchLastRecordsSensorData();

    const interval = setInterval(fetchLastRecordsSensorData, 10000); // actualizeaza datele la fiecare 10 secunde

    return () => clearInterval(interval);
  });

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/sensor/fetch-sensor-data`
        );
        const { data, timestamp } = response.data;
        console.log("Date primite: ", data);
        console.log("Timestamp " + timestamp);

        setSensorDataNow({
          MQ2: data.MQ2,
          MQ5: data.MQ5,
          MQ135: data.MQ135,
          DustDensity: data.DustDensity,
          Temperature: data.Temperature,
          Humidity: data.Humidity,
        });
        setSensorDataTimestamp(timestamp);
        const quality = calculateAirQuality(data);
        console.log("AIR QUALITY: ", quality);
        setAirQuality(quality);
      } catch (error) {
        console.log("Server indisponibil momentan...");
      }
    };

    fetchSensorData();

    const interval = setInterval(fetchSensorData, 10000); // actualizeaza datele la fiecare s10 secunde

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStationStatus = async () => {
      try {
        const response = await fetch(SERVER_URL);
        if (response.ok) {
          setStatus("Connected");
        } else {
          setStatus("Disconnected");
        }
      } catch (error) {
        setStatus("Disconnected");
      }
    };

    checkStationStatus();
    const interval = setInterval(checkStationStatus, 5000); // actualizeaza la fiecare 5 secunde

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sensorDataTimestamp) return;

    const interval = setInterval(() => {
      const now = new Date();
      const updatedAt = new Date(sensorDataTimestamp);

      if (isNaN(updatedAt.getTime())) {
        setLastUpdateAgo("");
        return;
      }
      const diffSeconds = Math.floor((now - updatedAt) / 1000);

      if (diffSeconds < 60) {
        setLastUpdateAgo(`${diffSeconds} seconds ago`);
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        setLastUpdateAgo(`${minutes} minutes ago`);
      } else {
        const hours = Math.floor(diffSeconds / 3600);
        setLastUpdateAgo(`acum ${hours} hours ago`);
      }
    }, 1000); // actualizează textul la fiecare secundă

    return () => clearInterval(interval);
  }, [sensorDataTimestamp]);
  return (
    <View style={styles.pageContainer}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Air Quality Station Dashboard</Text>
        <View style={{ flexDirection: "row", marginTop: 12 }}>
          <Text style={styles.subtitle}>Station Status: {status}</Text>
          <Text
            style={{
              fontSize: 24,
              paddingLeft: 10,
              color: status === "Connected" ? "green" : "red",
            }}
          >
            ●
          </Text>
        </View>
        <Text style={styles.statusText}>Overall air quality: {airQuality}</Text>
        <Text style={styles.statusText}>
          {lastUpdateAgo !== ""
            ? `Updated: ${lastUpdateAgo}`
            : "Waiting for data..."}
        </Text>
        <View style={styles.dataContainer}>
          <TouchableOpacity
            style={styles.dataCard}
            onPress={() =>
              onPressSetChartData(
                sensorDataHistory.Timestamp,
                sensorDataHistory.Temperature,
                "Temperature °C"
              )
            }
          >
            <Text style={styles.dataText}>
              Temperature: {sensorDataNow.Temperature}°C
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataCard}
            onPress={() =>
              onPressSetChartData(
                sensorDataHistory.Timestamp,
                sensorDataHistory.Humidity,
                "Humidity %"
              )
            }
          >
            <Text style={styles.dataText}>
              Humidity: {sensorDataNow.Humidity}%
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataCard}
            onPress={() =>
              onPressSetChartData(
                sensorDataHistory.Timestamp,
                sensorDataHistory.MQ2,
                "MQ2 ppm"
              )
            }
          >
            <Text style={styles.dataText}>MQ2: {sensorDataNow.MQ2} ppm</Text>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataCard}
            onPress={() =>
              onPressSetChartData(
                sensorDataHistory.Timestamp,
                sensorDataHistory.MQ5,
                "MQ5 ppm"
              )
            }
          >
            <Text style={styles.dataText}>MQ5: {sensorDataNow.MQ5} ppm</Text>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataCard}
            onPress={() =>
              onPressSetChartData(
                sensorDataHistory.Timestamp,
                sensorDataHistory.MQ135,
                "MQ135 ppm"
              )
            }
          >
            <Text style={styles.dataText}>
              MQ135: {sensorDataNow.MQ135} ppm
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataCard}
            onPress={() =>
              onPressSetChartData(
                sensorDataHistory.Timestamp,
                sensorDataHistory.DustDensity,
                "Dust Density mg/m³"
              )
            }
          >
            <Text style={styles.dataText}>
              Dust: {sensorDataNow.DustDensity} mg/m³
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sensorContainer}>
        <Text style={styles.title}>SENSORS</Text>
        <View
          style={{
            width: "100%",
            paddingHorizontal: 10,
            backgroundColor: "#fb8c00",
            borderRadius: 10, //

            marginTop: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 20} // 🔥 Ajustezi să țină cont de padding-ul de mai sus
            height={220}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#efada1",
              backgroundGradientTo: "#f5c6bd",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
              },
              propsForLabels: { fontSize: 12 },
            }}
            bezier
            style={{
              borderRadius: 10,
            }}
          />
        </View>
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("StatisticsScreen")}
        >
          <Image
            source={require("../resources/dashboardIcon.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require("../resources/houseIcon.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("AlertScreen")}>
          <Image
            source={require("../resources/warningIcon.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#a1e3ef",
  },
  statusContainer: {
    flex: 0.6,
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 60,
    backgroundColor: "#a1e3ef",
  },
  dataContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 14,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "black",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dataCard: {
    height: 50,
    width: 175,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    margin: 3,
    padding: 4,
  },
  dataText: {
    fontSize: 15,
    fontWeight: "400",
  },
  statusText: {
    paddingVertical: 6,
    fontSize: 18,
    fontWeight: "400",
  },
  sensorContainer: {
    flex: 0.5,
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#a1e3ef",
  },
  menuContainer: {
    flex: 0.12,
    flexDirection: "row",
    width: "75%",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "lightblue",
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    paddingVertical: 5,
    color: "#333",
  },
  logo: {
    width: 44,
    height: 44,
  },
});
