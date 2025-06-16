import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import Dialog from "react-native-dialog";
import { Platform } from "react-native";
import Checkbox from "expo-checkbox";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const env = require("./../env.js");
const BASE_URL = env.BASE_URL;

export const AlertInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { alert } = route.params;
  const [localAlert, setLocalAlert] = useState(alert);
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

  const [triggeredAlerts, setTriggeredAlerts] = useState();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

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
          `${BASE_URL}/alert/fetch-triggered-alerts?alert_id=${alert.id_alert}`
        );
        console.log(alert.id_alert);
        const data = await response.json();
        console.log(data);
        setTriggeredAlerts(data);
      } catch (error) {
        console.error(error);
        setTriggeredAlerts([]); // sau orice fallback vrei
      }
    };

    fetchTriggeredAlerts();
  }, []);

  const deleteAlert = async (alertId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/alert/delete-alert?id_alert=${alertId}`
      );
      console.log("Alert deleted:", response.data);
      Alert.alert("Succes", "Alert deleted succesfully");
      navigation.navigate("AlertScreen");
    } catch (error) {
      console.error("Error deleting alert: ", error);
    }
  };

  const updateAlertValue = async (alertId, newValue) => {
    try {
      const response = await axios.put(`${BASE_URL}/alert/update-alert`, {
        id_alert: alertId,
        new_value: newValue,
      });

      console.log("Alert updated:", response.data);
      Alert.alert("Success", "Alert updated successfully!");
    } catch (error) {
      console.error("Error updating alert:", error);
      Alert.alert("Error", "Could not update alert.");
    }
  };

  const handlePress = () => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Update Alert Value",
        "Change the alert value:",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: (value) => {
              const numericValue = Number(value);
              if (!isNaN(numericValue)) {
                updateAlertValue(alert.id_alert, numericValue);
                setLocalAlert((prev) => ({
                  ...prev,
                  sensor_alert_value: numericValue,
                }));
              } else {
                Alert.alert("Invalid Input", "Please enter a valid number.");
              }
            },
          },
        ],
        "plain-text",
        ""
      );
    } else {
      // Android: arătăm dialogul custom
      setDialogVisible(true);
    }
  };

  const handleDialogOk = () => {
    const numericValue = Number(inputValue);
    if (!isNaN(numericValue)) {
      updateAlertValue(alert.id_alert, numericValue);
      setLocalAlert((prev) => ({
        ...prev,
        sensor_alert_value: numericValue,
      }));
      setDialogVisible(false);
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number.");
    }
  };

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
          <Text style={styles.checkBoxText}>Phone SMS</Text>
          <Checkbox
            style={styles.checkboxSize}
            value={togglePhoneCheckBox}
            onValueChange={setTogglePhoneCheckBox}
            tintColors={{ true: "#007AFF", false: "#ccc" }}
          />
        </View>

        <View>
          <Text style={{ paddingTop: 8, fontSize: 19 }}>
            Condition: {localAlert.sensor_name}
            {localAlert.comparison_operator}
            {localAlert.sensor_alert_value} ({unit})
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
            {!triggeredAlerts ? (
              <Text
                style={{
                  alignSelf: "center",
                  fontSize: 24,
                  fontWeight: "500",
                }}
              >
                Loading...
              </Text>
            ) : triggeredAlerts.length > 0 ? (
              triggeredAlerts.map((alert, index) => (
                <View key={index} style={{ paddingBottom: 10 }}>
                  <Text style={{ fontSize: 19, fontWeight: "400" }}>
                    {index + 1}.
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "300" }}>
                    Triggered at:{" "}
                    {new Date(alert.triggered_at).toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "300" }}>
                    {" "}
                    Stopped at:{" "}
                    {alert.ended_at
                      ? new Date(alert.ended_at).toLocaleString()
                      : "Active"}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                style={{
                  alignSelf: "center",
                  fontSize: 18,
                  fontWeight: "400",
                }}
              >
                This alert has not been triggered before.
              </Text>
            )}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handlePress}>
          <Text>Update Alert Value</Text>
        </TouchableOpacity>

        <Dialog.Container visible={dialogVisible}>
          <Dialog.Title>Update Alert Value</Dialog.Title>
          <Dialog.Description>Change the alert value:</Dialog.Description>
          <Dialog.Input
            keyboardType="numeric"
            onChangeText={(text) => setInputValue(text)}
            value={inputValue}
          />
          <Dialog.Button
            label="Cancel"
            onPress={() => setDialogVisible(false)}
          />
          <Dialog.Button label="OK" onPress={handleDialogOk} />
        </Dialog.Container>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Confirm Delete",
              "Are you sure you want to delete this alert?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: async () => {
                    await deleteAlert(alert.id_alert);
                  },
                  style: "destructive",
                },
              ],
              { cancelable: true }
            );
          }}
        >
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
