import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Svg, Circle, Text as SvgText } from "react-native-svg";
BASE_URL = "http://192.168.0.104:3000";

const sensorDropdown = [
  { label: "Temperature", value: "Temperature" },
  { label: "Humidity", value: "Humidity" },
  { label: "MQ2", value: "MQ2" },
  { label: "MQ5", value: "MQ5" },
  { label: "MQ135", value: "MQ135" },
  { label: "Dust Density", value: "DustDensity" },
];

const timeDropdown = [
  { label: "1 hour", value: "1h" },
  { label: "Today", value: "today" },
  { label: "24 hours", value: "1d" },
  { label: "1 week", value: "7d" },
  { label: "1  month", value: "30d" },
];

export const StatisticsScreen = () => {
  const navigation = useNavigation();
  const [selectedSensor, setSelectedSensor] = useState("Temperature");
  const [selectedTime, setSelectedTime] = useState("today");
  const [chartData, setChartData] = useState({
    labels: [0],
    datasets: [{ data: [0] }],
    legend: [""],
  });
  const [rawData, setRawData] = useState([]);
  const [sensorMeasurementUnit, setSensorMeasurementUnit] = useState("°C");
  const sensorUnits = {
    Temperature: "°C",
    Humidity: "%",
    MQ2: "ppm",
    MQ5: "ppm",
    MQ135: "ppm",
    DustDensity: "mg/m³",
  };
  const [touchedValue, setTouchedValue] = useState(null);

  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
    label: "",
  });

  useEffect(() => {
    setSensorMeasurementUnit(sensorUnits[selectedSensor] || "");
  }, [selectedSensor]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/filter/sensor-data?sensor=${selectedSensor}&range=${selectedTime}`
        );
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          setRawData([]);
          setChartData({
            labels: [],
            datasets: [{ data: [] }],
            legend: [`${selectedSensor} Values`],
          });
          return;
        }

        const maxLabels = Math.min(7, data.length);
        const labelIndices = Array.from({ length: maxLabels }, (_, i) =>
          Math.floor((i * (data.length - 1)) / (maxLabels - 1))
        );

        const longRange = ["7d", "30d"].includes(selectedTime);

        const values = data.map((entry) => entry.value);
        const labels = data.map((entry, index) => {
          if (!labelIndices.includes(index)) return "";

          const date = new Date(entry.Timestamp);
          const hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const day = date.getDate();
          const month = date.getMonth() + 1; // lunile încep de la 0

          return longRange
            ? `${day}/${month}` // doar data
            : `${hours}:${minutes}`;
        });

        setRawData(data);

        setChartData({
          labels: labels,
          datasets: [
            {
              data: values,
              color: (opacity = 1) => `rgba(134, 65, 244, 1)`,
              strokeWidth: 2,
            },
          ],
          legend: [`${selectedSensor} Values`],
        });
      } catch (error) {
        console.error("Eroare la fetch:", error);
      }
    };
    fetchData();
  }, [selectedSensor, selectedTime]);
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
          <Text style={styles.dataText}>
            {selectedTime} chart for {selectedSensor}{" "}
          </Text>
          <Text style={styles.dataText}>
            Most recent value: {chartData.datasets[0]?.data.at(-1) ?? "N/A"}{" "}
            {sensorMeasurementUnit}
          </Text>
          <Text style={styles.dataText}>
            Last updated:{" "}
            {rawData.at(-1)?.Timestamp
              ? new Date(rawData.at(-1).Timestamp).toLocaleString("ro-RO", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </Text>
        </View>
        <View style={styles.chartContainer}>
          {touchedValue && (
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {touchedValue.value} {sensorMeasurementUnit}
              </Text>
            </View>
          )}
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 20}
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
                r: "0",
              },
              propsForLabels: { fontSize: 12 },
            }}
            withShadow={false}
            decorator={() => {
              return tooltipPos.visible ? (
                <Svg key={`${selectedSensor}`}>
                  <Circle
                    cx={tooltipPos.x}
                    cy={tooltipPos.y}
                    r="4"
                    stroke="black"
                    strokeWidth="1"
                    fill="white"
                  />

                  <SvgText
                    x={tooltipPos.x}
                    y={Math.max(tooltipPos.y - 10, 15)}
                    fill="white"
                    fontSize="18"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {`${tooltipPos.value} ${sensorMeasurementUnit}`}
                  </SvgText>
                </Svg>
              ) : null;
            }}
            onDataPointClick={(data) => {
              let isSamePoint =
                tooltipPos.x === data.x && tooltipPos.y === data.y;

              setTooltipPos((prevState) => ({
                x: data.x,
                y: data.y,
                value: data.value,
                label: chartData.labels[data.index],
                visible: !isSamePoint || !prevState.visible,
              }));
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
