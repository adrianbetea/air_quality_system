import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import axios from "axios";
import { BASE_URL } from "../env";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sensorDropdown = [
  { label: "Temperature", value: "Temperature" },
  { label: "Humidity", value: "Humidity" },
  { label: "MQ2", value: "MQ2" },
  { label: "MQ5", value: "MQ5" },
  { label: "MQ135", value: "MQ135" },
  { label: "Dust Density", value: "DustDensity" },
];

const comparisonDropdown = [
  { label: "Greater (>)", value: ">" },
  { label: "Lower (<)", value: "<" },
];

export const CreateAlert = () => {
  const navigation = useNavigation();

  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedComparator, setSelectedComparator] = useState(null);

  const [form, setForm] = useState({
    alert_value: "",
    alert_description: "",
  });

  const [toggleNotificationCheckBox, setToggleNotificationCheckBox] =
    useState(false);
  const [toggleEmailCheckBox, setToggleEmailCheckBox] = useState(false);
  const [togglePhoneCheckBox, setTogglePhoneCheckBox] = useState(false);

  const createAlert = async (
    selectedSensor,
    selectedComparator,
    form,
    toggleNotificationCheckBox,
    toggleEmailCheckBox,
    togglePhoneCheckBox
  ) => {
    try {
      const alertValue = form.alert_value;
      const alertDescription = form.alert_description;

      if (!selectedSensor || !selectedComparator || !alertValue) {
        Alert.alert(
          "Incomplete Fields",
          "Please fill in all required alert parameters.",
          [{ text: "OK" }]
        );
        return;
      }
      if (
        !toggleNotificationCheckBox &&
        !toggleEmailCheckBox &&
        !togglePhoneCheckBox
      ) {
        Alert.alert(
          "No Alert Method Selected",
          "Please select at least one alert method: push notification, email, or phone.",
          [{ text: "OK" }]
        );
        return;
      }
      const userId = await AsyncStorage.getItem("user_id");
      const alertName = `${selectedSensor} ${selectedComparator} ${alertValue}`;

      const payload = {
        user_id: userId,
        alert_name: alertName,
        alert_description: alertDescription,
        sensor_name: selectedSensor,
        sensor_alert_value: Number(alertValue),
        comparison_operator: selectedComparator,
        notification_check: toggleNotificationCheckBox,
        email_check: toggleEmailCheckBox,
        phone_check: togglePhoneCheckBox,
      };

      const response = await axios.post(
        `${BASE_URL}/alert/create-alert`,
        payload
      );
      console.log("Alertă creată cu succes:", response.data);
      navigation.navigate("AlertScreen");
      return response.data;
    } catch (error) {
      console.error("Eroare la crearea alertei:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.pageContainer}>
        <View style={styles.mainContainer}>
          <Text style={styles.title}>Create Alert</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("AlertScreen")}
          >
            <Image
              style={styles.logo}
              source={require("../resources/backArrow.png")}
            />
          </TouchableOpacity>

          <View style={{ marginTop: 28 }}>
            <Text style={styles.inputLabel}>Sensor Name</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={sensorDropdown}
              labelField="label"
              valueField="value"
              placeholder="Select Sensor"
              value={selectedSensor}
              onChange={(item) => {
                setSelectedSensor(item.value);
              }}
            />
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.inputLabel}>Comparison Operator</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={comparisonDropdown}
              labelField="label"
              valueField="value"
              placeholder="Select Comparator"
              value={selectedComparator}
              onChange={(item) => {
                setSelectedComparator(item.value);
              }}
            />
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.inputLabel}>Alert Value</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="number-pad"
              style={styles.inputControlValue}
              value={form.alert_value}
              onChangeText={(text) => {
                setForm({ ...form, alert_value: text }); // nu converti aici
              }}
              placeholder="Set an alert threshold"
            ></TextInput>
          </View>

          <View>
            <Text style={styles.inputLabel}>Alert Description</Text>
            <TextInput
              autoCapitalize="sentences"
              autoCorrect={false}
              keyboardType="default"
              multiline={true}
              style={styles.inputControlDescription}
              value={form.alert_description}
              onChangeText={(text) => {
                setForm({ ...form, alert_description: text }); // nu converti aici
              }}
              placeholder="Describe your alert"
            ></TextInput>
          </View>

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

          <TouchableOpacity
            style={styles.createButton}
            onPress={async () => {
              await createAlert(
                selectedSensor,
                selectedComparator,
                form,
                toggleNotificationCheckBox,
                toggleEmailCheckBox,
                togglePhoneCheckBox
              );
            }}
          >
            <Text>Create Alert</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    paddingBottom: 5,
  },
  backButton: {
    position: "absolute",
    top: 65,
    right: 25,
  },
  logo: { width: 65, height: 65 },
  createButton: {
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
  dropdown: {
    height: 55,
    borderBottomColor: "gray",
    borderWidth: 0.75,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 5,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginBottom: 5,
  },
  inputControlValue: {
    height: 46,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    marginBottom: 13,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "500",
    color: "#222",
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: "100%",
    borderWidth: 0.5,
  },
  inputControlDescription: {
    height: 68,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    marginBottom: 13,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: "300",
    color: "#222",
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: "100%",
    borderWidth: 0.5,
    textAlignVertical: "top",
  },
  checkContainer: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  checkBoxText: {
    fontSize: 23,
    paddingRight: 20,
  },
  checkboxSize: { width: 31, height: 31 },
});
