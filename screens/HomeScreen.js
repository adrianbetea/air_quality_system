import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [status, setStatus] = useState("Checking");
  const navigation = useNavigation();

  useEffect(() => {
    const checkStationStatus = async () => {
      try {
        const response = await fetch("http://192.168.0.107");
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
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Station Status: {status}</Text>
        {/* Aici trebuie sa adaug un cerc care sa fie verde daca e connected si rosu daca nu */}
      </View>
      <View style={styles.sensorContainer}>
        <Text style={styles.title}>SENSORS</Text>
      </View>
      <View style={styles.menuContainer}>
        <Text style={styles.title}>A</Text>
        <Text style={styles.title}>B</Text>
        <Text style={styles.title}>C</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 16,
  },
  statusContainer: {
    flex: 0.45,
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "red",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
