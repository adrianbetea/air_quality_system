import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { AlertScreen } from "./screens/AlertScreen";
import { StatisticsScreen } from "./screens/StatisticsScreen";
import { AlertInfo } from "./screens/AlertInfo";
import { CreateAlert } from "./screens/CreateAlert";
import "expo-dev-client";
import { usePushNotifications } from "./utils/usePushNotifications";

const Stack = createNativeStackNavigator();

export default function App() {
  const { expoPushToken, notification } = usePushNotifications();

  const data = JSON.stringify(notification, undefined, 2);

  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test notificare",
        body: "Aceasta este o notificare de test.",
        sound: "default",
      },
      trigger: { seconds: 1 },
    });
  };
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="AlertScreen"
          component={AlertScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="CreateAlert"
          component={CreateAlert}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="StatisticsScreen"
          component={StatisticsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />

        <Stack.Screen
          name="AlertInfo"
          component={AlertInfo}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
