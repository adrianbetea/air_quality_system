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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../env";

export const LoginScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login success:", data);
        navigation.navigate("HomeScreen");
      } else {
        console.warn("Login failed:", data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
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
          <TouchableOpacity onPress={handleLogin}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Login</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("RegisterScreen")}
          >
            <Text style={styles.formFooter}>
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageContainer: { flex: 1, width: "100%", height: "100%" },
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
