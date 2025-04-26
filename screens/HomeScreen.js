import React, { useEffect, useState } from "react";
import axios from "axios";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../env";

export default function HomeScreen() {
  const [status, setStatus] = useState("Disconnected");
  const [sensorData, setSensorData] = useState({
    MQ2: "",
    MQ5: "",
    MQ135: "",
    DustDensity: "",
    Temperature: "",
    Humidity: "",
  });
  const [sensorDataTimestamp, setSensorDataTimestamp] = useState();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/sensor/fetch-sensor-data`
        );
        const { data, timestamp } = response.data;
        console.log("Date primite: ", data);
        console.log("Timestamp " + timestamp);

        setSensorData({
          MQ2: data.MQ2,
          MQ5: data.MQ5,
          MQ135: data.MQ135,
          DustDensity: data.DustDensity,
          Temperature: data.Temperature,
          Humidity: data.Humidity,
        });
        setSensorDataTimestamp(timestamp);
      } catch (error) {
        console.error("Eroare la fetch", error);
      }
    };

    fetchSensorData();

    const interval = setInterval(fetchSensorData, 10000); // 10000 ms = 10 secunde

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStationStatus = async () => {
      try {
        const response = await fetch("http://192.168.0.105");
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
  }, []);

  return (
    <View style={styles.pageContainer}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Air Quality Station Dashboard</Text>
        <View style={{ flexDirection: "row", marginTop: 12 }}>
          <Text style={styles.subtitle}>Station Status: {status}</Text>
          <Text
            style={{
              fontSize: 20,
              paddingLeft: 10,
              color: status === "Connected" ? "green" : "red",
            }}
          >
            ●
          </Text>
        </View>
        <View style={styles.dataContainer}>
          <View style={styles.dataCard}>
            <Text>Temperature: {sensorData.Temperature}</Text>
          </View>
          <View style={styles.dataCard}>
            <Text>Humidity: {sensorData.Humidity}</Text>
          </View>
          <View style={styles.dataCard}>
            <Text>MQ2 Sensor: {sensorData.MQ2}</Text>
          </View>
          <View style={styles.dataCard}>
            <Text>MQ5 Sensor: {sensorData.MQ5}</Text>
          </View>
          <View style={styles.dataCard}>
            <Text>MQ135 Sensor: {sensorData.MQ135}</Text>
          </View>
          <View style={styles.dataCard}>
            <Text>Dust Sensor: {sensorData.DustDensity}</Text>
          </View>
        </View>
        <Text>Overall air quality:</Text>
        <Text>Last time updated: {sensorDataTimestamp}</Text>
      </View>
      <View style={styles.sensorContainer}>
        <Text style={styles.title}>SENSORS</Text>
      </View>
      <View style={styles.menuContainer}>
        <Text style={styles.title}>A</Text>
        <Text style={styles.title}>B</Text>
        <Text style={styles.title}>C</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  statusContainer: {
    flex: 0.45,
    width: "100%",
    paddingHorizontal: 14,
    paddingTop: 60,
    backgroundColor: "#a1e3ef",
  },
  dataContainer: {
    backgroundColor: "red",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  dataCard: {
    height: 40,
    width: 150,
    alignItems: "baseline",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 10,
    margin: 2,
    padding: 5,
  },
  sensorContainer: {
    flex: 0.47,
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "yellow",
  },
  menuContainer: {
    flex: 0.08,
    flexDirection: "row",
    width: "90%",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "lightblue",
    borderRadius: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    paddingTop: 1,
    color: "#333",
  },
});
