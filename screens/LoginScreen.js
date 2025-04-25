import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.formContainer}></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
    padding: 16,
  },
  formContainer: {
    flex: 0.7,
    width: "100%",
    alignItems: "center",
    backgroundColor: "red",
  },
});
