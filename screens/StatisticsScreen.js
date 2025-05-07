import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const chartData = {
  labels: ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"],
  datasets: [
    {
      data: [22, 24, 19, 25, 23, 27, 26], // valori de temperatură fictive
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // culoare custom linie
      strokeWidth: 2, // grosimea liniei
    },
  ],
  legend: ["Temperatura (°C)"], // legenda opțională
};

const sensorDropdown = [
  { label: "Temperature", value: "1" },
  { label: "Humidity", value: "2" },
  { label: "MQ2", value: "3" },
  { label: "MQ5", value: "4" },
  { label: "MQ135", value: "5" },
  { label: "Dust Density", value: "6" },
];

const timeDropdown = [
  { label: "1 hour", value: "7" },
  { label: "Today", value: "8" },
  { label: "24 hours", value: "9" },
  { label: "1 week", value: "10" },
  { label: "1  month", value: "11" },
];
export const StatisticsScreen = () => {
  const navigation = useNavigation();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  return (
    <View style={styles.pageContainer}>
      <View style={styles.statisticsContainer}>
        <Text style={styles.title}>Statistics</Text>
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
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={timeDropdown}
          labelField="label"
          valueField="value"
          placeholder="Select Time"
          value={selectedTime}
          onChange={(item) => {
            setSelectedTime(item.value);
          }}
        />
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>X chart for Y sensor</Text>
          <Text style={styles.dataText}>Most recent value: Z ppm</Text>
          <Text style={styles.dataText}>Last time updated</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 20} // 🔥 Ajustezi să țină cont de padding-ul de mai sus
            height={250}
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
  statisticsContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#a1e3ef",
    paddingHorizontal: 10,
    paddingTop: 75,
  },
  dataContainer: {
    width: "100%",
    height: 120,
    marginVertical: 10,
  },
  dataText: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 20,
    fontWeight: "400",
  },
  chartContainer: {
    width: "100%",

    height: 250,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    paddingBottom: 5,
  },
  logo: {
    width: 44,
    height: 44,
  },
  dropdown: {
    height: 65,
    borderBottomColor: "gray",
    borderWidth: 0.75,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 8,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
