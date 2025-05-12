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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../env";

export const AlertInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { alert } = route.params;
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
  const [toggleNotificationCheckBox, setToggleNotificationCheckBox] =
    useState(false);
  const [toggleEmailCheckBox, setToggleEmailCheckBox] = useState(false);
  const [togglePhoneCheckBox, setTogglePhoneCheckBox] = useState(false);

  const [userId, setUserId] = useState(null);

  const [triggeredAlerts, setTriggeredAlerts] = useState(null);

  useEffect(() => {
    const fetchCheckboxStates = async () => {
      if (!userId || !alert?.id_alert) return;

      try {
        const response = await fetch(
          `${BASE_URL}/alert/get-checks?user_id=${userId}&id_alert=${alert.id_alert}`
        );
        const data = await response.json();

        setToggleNotificationCheckBox(data.notification_check === 1);
        setToggleEmailCheckBox(data.email_check === 1);
        setTogglePhoneCheckBox(data.phone_check === 1);
      } catch (error) {
        console.error("Eroare la fetch inițial:", error);
      }
    };

    fetchCheckboxStates();
  }, [userId, alert?.id_alert]);

  useEffect(() => {
    const setDatabaseCheckbox = async () => {
      if (!userId || !alert?.id_alert) return;

      try {
        const response = await fetch(`${BASE_URL}/alert/update-checks`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            id_alert: alert.id_alert,
            notification_check: toggleNotificationCheckBox ? 1 : 0,
            email_check: toggleEmailCheckBox ? 1 : 0,
            phone_check: togglePhoneCheckBox ? 1 : 0,
          }),
        });

        const result = await response.json();
        console.log("Actualizat:", result);
      } catch (error) {
        console.error("Eroare la update:", error);
      }
    };

    setDatabaseCheckbox();
  }, [toggleNotificationCheckBox, toggleEmailCheckBox, togglePhoneCheckBox]);

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
    const fetchTriggeredAlerts = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/alert/process-alerts?user_id=${userId}`
        );

        const data = await response.json();

        const filteredAlerts = {
          ...data,
          dateleActualizate: data.dateleActualizate?.filter(
            (a) => a.id_alert === alert.id_alert
          ),
        };

        setTriggeredAlerts(filteredAlerts);
      } catch (error) {}
    };
    fetchTriggeredAlerts();
  }, [userId]);

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
        <Text style={{ paddingBottom: 5, paddingRight: 75 }}>
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
          <Text style={{ paddingTop: 8, fontSize: 19 }}>
            Alert condition: {alert.sensor_name}
            {alert.comparison_operator}
            {alert.sensor_alert_value}({unit})
          </Text>
          <Text style={{ paddingTop: 4, fontSize: 19 }}>
            Date added:{" "}
            {new Date(alert.date_added).toLocaleString("ro-RO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={{ paddingTop: 10, fontSize: 19, alignSelf: "center" }}>
            Times triggered
          </Text>
        </View>
        <View style={styles.timesTriggeredContainer}>
          <ScrollView>
            {!triggeredAlerts ||
            triggeredAlerts.dateleActualizate?.length === 0 ? (
              <Text
                style={{
                  alignSelf: "center",
                  fontSize: 24,
                  fontWeight: "500",
                }}
              >
                Loading...
              </Text>
            ) : (
              triggeredAlerts.dateleActualizate.map((alert, index) => (
                <View key={index} style={{ paddingBottom: 10 }}>
                  <Text style={{ fontSize: 19, fontWeight: "400" }}>
                    {index + 1}.
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "300" }}>
                    Triggered at:{" "}
                    {new Date(alert.triggered_at).toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "300" }}>
                    Stopped at: {new Date(alert.ended_at).toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.updateButton}>
          <Text>Update Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton}>
          <Text>Delete Alert</Text>
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
  checkContainer: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  timesTriggeredContainer: {
    marginTop: 6,
    padding: 8,
    height: 250,
    borderRadius: 15,
    borderWidth: 2,
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
  logo: { width: 65, height: 65 },
  backButton: {
    position: "absolute",
    top: 65,
    right: 25,
  },
  updateButton: {
    width: "75%",
    height: 55,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 30,
    marginVertical: 16,
    backgroundColor: "#c5e9f7",
  },
  deleteButton: {
    width: "75%",
    height: 55,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 30,
    marginBottom: 40,
    backgroundColor: "#c5e9f7",
  },
});
