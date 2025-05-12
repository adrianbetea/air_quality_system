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

export const CreateAlert = () => {
  const navigation = useNavigation();

  return (
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

        <TouchableOpacity style={styles.createButton}>
          <Text>Create Alert</Text>
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
});
