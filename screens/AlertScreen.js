import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

BASE_URL = "http://192.168.0.104:3000";

export const AlertScreen = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const id = await AsyncStorage.getItem("user_id");
        if (id !== null) {
          setUserId(id);
        }
      } catch (error) {
        console.error("Eroare la citirea user_id:", error);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");

        const response = await fetch(
          `${BASE_URL}/alert/fetch-data?user_id=${userId}`
        );
        const data = await response.json();

        if (response.ok) {
          //console.log("Alertele userului:", data);
          setAlerts(data);
        } else {
          console.warn("Eroare la fetch alerts: ", data.message);
        }
      } catch (error) {
        console.error("Eroare la fetch: ", error);
      }
    };
    fetchAlerts();
  }, [userId]);

  return (
    <View style={styles.pageContainer}>
      <View style={styles.mainContainer}>
        <Text style={styles.title}>Alerts</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.alertContainer}
        >
          {alerts.map((alert, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cardContainer}
              onPress={() => navigation.navigate("AlertInfo", { alert })}
            >
              <View style={styles.infoContainer}>
                <Text style={styles.cardTitle}>{alert.sensor_name}</Text>
                <Text style={styles.cardText}>{alert.alert_description}</Text>
                <Text style={styles.cardText}>Alert Type: RECURRENT</Text>
                <Text>
                  Date added:{" "}
                  {new Date(alert.date_added).toLocaleString("ro-RO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                  }}
                >
                  Tap to see more info →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CreateAlert")}
      >
        <Text style={{ fontSize: 20, fontWeight: "400", paddingVertical: 3 }}>
          Add new alert
        </Text>
      </TouchableOpacity>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("StatisticsScreen")}
        >
          <Image
            source={require("../resources/dashboardIcon.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
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
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#a1e3ef",
  },
  mainContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#a1e3ef",
    paddingHorizontal: 10,
    paddingTop: 75,
  },
  alertContainer: {
    width: "100%",
    height: 525,
    marginVertical: 10,
    padding: 8,
    borderWidth: 0.5,
  },
  cardContainer: {
    backgroundColor: "#B4D9E0",
    width: "100%",
    height: 130,
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    marginVertical: 5,
  },
  infoContainer: {
    flex: 1.1,
    paddingVertical: 7,
    paddingHorizontal: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "500",
  },
  cardText: {
    fontSize: 12,
    paddingVertical: 3,
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
  addButton: {
    height: 50,
    width: "75%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 15,
    backgroundColor: "#c5e9f7",
  },
  logo: {
    width: 44,
    height: 44,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    paddingBottom: 5,
  },
});
