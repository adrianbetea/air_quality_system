import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Touchable,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
const env = require("./../env.js");
const BASE_URL = env.BASE_URL;

export const RegisterScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleRegister = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("User registered successfully:", data);
        Alert.alert("Succes", "Account created succesfully");
        navigation.navigate("LoginScreen");
      } else {
        console.warn("Register failed:", data.message);
      }
    } catch (error) {
      console.error("Error during register:", error);
    }
  };

  return (
    <ImageBackground
      style={styles.imageContainer}
      resizeMode="cover"
      source={require("../resources/backgroundLogin.jpg")}
    >
      <SafeAreaView style={styles.pageContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.inputControl}
            value={form.username}
            onChangeText={(username) => setForm({ ...form, username })}
            placeholder="Ion"
            placeholderTextColor="#6b7280"
          ></TextInput>
          <Text style={styles.inputLabel}>Email address</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.inputControl}
            value={form.email}
            onChangeText={(email) => setForm({ ...form, email })}
            placeholder="ion@example.com"
            placeholderTextColor="#6b7280"
          ></TextInput>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.inputControl}
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(phone) => setForm({ ...form, phone })}
            placeholder="07xxxxxxxx"
            maxLength={10}
            placeholderTextColor="#6b7280"
          ></TextInput>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            secureTextEntry
            style={styles.inputControl}
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
            placeholder="********"
            placeholderTextColor="#6b7280"
          ></TextInput>
        </View>
        <View style={styles.formAction}>
          <TouchableOpacity onPress={handleRegister}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Register</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
            <Text style={styles.formFooter}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageContainer: { flex: 1 },
  pageContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f2f2f2",
    padding: 16,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  formContainer: {
    width: "100%",
  },
  formAction: {
    marginVertical: 24,
    marginHorizontal: 32,
  },
  formFooter: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    letterSpacing: 1,
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 22,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  inputControl: {
    height: 46,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "500",
    color: "#222",
    width: "85%",
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#70B5D4",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#70B5D4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
});
