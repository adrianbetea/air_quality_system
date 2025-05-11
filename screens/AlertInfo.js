import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

export const AlertInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { alert } = route.params;
  const [toggleNotificationCheckBox, setToggleNotificationCheckBox] =
    useState(false);

  const unitMap = [
    { key: "MQ2", value: "ppm" },
    { key: "MQ5", value: "ppm" },
    { key: "MQ135", value: "ppm" },
    { key: "Temperature", value: "°C" },
    { key: "Humidity", value: "%" },
    { key: "DustDensity", value: "mg/m³" },
  ];
  const unit =
    unitMap.find((item) => item.key === alert.sensor_name)?.value ?? "";

  const [toggleEmailCheckBox, setToggleEmailCheckBox] = useState(false);

  const [togglePhoneCheckBox, setTogglePhoneCheckBox] = useState(false);

  return (
    <View style={styles.pageContainer}>
      <View style={styles.mainContainer}>
        <Text style={styles.title}>Alert {alert.sensor_name}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("AlertScreen")}
        >
          <Image
            style={styles.logo}
            source={require("../resources/backArrow.png")}
          />
        </TouchableOpacity>
        <Text style={{ paddingBottom: 20, paddingRight: 60 }}>
          {alert.alert_description}
        </Text>

        <View style={styles.checkContainer}>
          <Text style={styles.checkBoxText}>Notification</Text>
          <Checkbox
            style={styles.checkboxSize}
            value={toggleNotificationCheckBox}
            onValueChange={setToggleNotificationCheckBox}
            tintColors={{ true: "#007AFF", false: "#ccc" }}
          />
        </View>
        <View style={styles.checkContainer}>
          <Text style={styles.checkBoxText}>Email</Text>
          <Checkbox
            style={styles.checkboxSize}
            value={toggleEmailCheckBox}
            onValueChange={setToggleEmailCheckBox}
            tintColors={{ true: "#007AFF", false: "#ccc" }}
          />
        </View>
        <View style={styles.checkContainer}>
          <Text style={styles.checkBoxText}>Phone</Text>
          <Checkbox
            style={styles.checkboxSize}
            value={togglePhoneCheckBox}
            onValueChange={setTogglePhoneCheckBox}
            tintColors={{ true: "#007AFF", false: "#ccc" }}
          />
        </View>

        <View>
          <Text style={{ paddingTop: 10, fontSize: 18 }}>
            {alert.sensor_name}
            {alert.comparison_operator}
            {alert.sensor_alert_value}({unit})
          </Text>
          <Text style={{ paddingTop: 4, fontSize: 18 }}>
            Date added:{" "}
            {new Date(alert.date_added).toLocaleString("ro-RO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <ScrollView></ScrollView>
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
  checkContainer: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 9,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    paddingBottom: 5,
  },
  checkBoxText: {
    fontSize: 23,
    paddingRight: 20,
  },
  checkboxSize: { width: 28, height: 28 },
  logo: { width: 60, height: 60 },
  backButton: {
    position: "absolute",
    top: 65,
    right: 25,
  },
});
