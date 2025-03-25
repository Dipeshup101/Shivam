import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

// Import your global CSS file
import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F3F4F6',
        },
        headerTintColor: colorScheme === 'dark' ? '#F3F4F6' : '#1F2937',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF',
        },
      }}
      initialRouteName="login"
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Derma Analyzer",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Register",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}