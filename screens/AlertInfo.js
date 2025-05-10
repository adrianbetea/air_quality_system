import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export const AlertInfo = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.pageContainer}>
      <View style={styles.mainContainer}>
        <Text style={styles.title}>Alerts</Text>
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
    width: "100%",
    height: 80,
    borderWidth: 2,
    borderRadius: 10,
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
