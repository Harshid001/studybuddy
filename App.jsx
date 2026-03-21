// App.js
import "./global.css";
import React from "react";
import { StatusBar, View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import {
  useFonts,
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
} from "@expo-google-fonts/lato";
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from "@expo-google-fonts/playfair-display";
import {
  SourceCodePro_400Regular,
  SourceCodePro_600SemiBold,
} from "@expo-google-fonts/source-code-pro";

import { DataProvider }   from "./src/context/DataContext";
import SplashScreen       from "./src/screens/SplashScreen";
import DashboardScreen    from "./src/screens/DashboardScreen";
import StudentsScreen     from "./src/screens/StudentsScreen";
import AdminScreen        from "./src/screens/AdminScreen";
import AITutorScreen      from "./src/screens/AITutorScreen";
import NotesScreen        from "./src/screens/NotesScreen";
import StudyPlannerScreen from "./src/screens/StudyPlannerScreen";
import PomodoroScreen from "./src/screens/PomodoroScreen";
import MockTestScreen from "./src/screens/MockTestScreen";
import AssignmentScreen from "./src/screens/AssignmentScreen";
import GamificationScreen from "./src/screens/GamificationScreen";
import {
  ActivityScreen,
  ProgressScreen,
  ChatsScreen,
} from "./src/screens/ActivityScreen";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Shared header options ────────────────────────────────────
const HEADER = {
  headerStyle: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 2,
    borderBottomColor: "#1a4480",
  },
  headerTitleStyle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 17,
    color: "#0f2d5c",
  },
  headerTintColor:  "#1a4480",
  contentStyle:     { backgroundColor: "#f8f7f4" },
};

// ── Tab icon ────────────────────────────────────────────────
function TabIcon({ icon, label, focused }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
      <Text style={{ fontSize: 19 }}>{icon}</Text>
      <Text style={{
        fontSize: 9.5, marginTop: 2,
        fontFamily: "Lato_700Bold",
        color: focused ? "#1a4480" : "#8e8e98",
      }}>
        {label}
      </Text>
    </View>
  );
}

// ── Dashboard Stack ─────────────────────────────────────────
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen}
        options={{ title: "Dashboard" }} />
      <Stack.Screen name="Gamification" component={GamificationScreen}
        options={{ title: "Learning Progress" }} />
      <Stack.Screen name="StudyPlanner" component={StudyPlannerScreen}
        options={{ title: "Study Planner" }} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen}
        options={{ title: "Focus Timer" }} />
      <Stack.Screen name="MockTest" component={MockTestScreen}
        options={{ title: "Mock Tests" }} />
    </Stack.Navigator>
  );
}

// ── Students Stack ───────────────────────────────────────────
function StudentsStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="StudentsHome" component={StudentsScreen}
        options={{ title: "All Students" }} />
    </Stack.Navigator>
  );
}

// ── Records sub-menu home ────────────────────────────────────
function RecordsHome({ navigation }) {
  const items = [
    { icon: "⚡", title: "Activity Log",      sub: "All events in real time",       screen: "Activity",  accent: "#1a4480" },
    { icon: "📈", title: "Progress Reports",  sub: "Per-student learning summary",  screen: "Progress",  accent: "#0d6e6e" },
    { icon: "💬", title: "Chat History",      sub: "All AI tutor conversations",    screen: "Chats",     accent: "#b45309" },
    { icon: "📝", title: "AI Notes",sub: "Notes created by the AI tutor", screen: "Notes",     accent: "#5b21b6" },
    { icon: "🗓️", title: "Study Planner",sub: "Day-wise AI study plans", screen: "StudyPlanner", accent: "#1a4480" },
    { icon: "⏱️", title: "Focus Timer",sub: "Pomodoro and focus streaks", screen: "Pomodoro", accent: "#0d6e6e" },
    { icon: "📊", title: "Mock Tests",sub: "Generate and attempt AI tests", screen: "MockTest", accent: "#b45309" },
    { icon: "📋", title: "Assignments",sub: "Assignment planner + AI breakdown", screen: "Assignment", accent: "#5b21b6" },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: "#f8f7f4", padding: 16 }}>
      <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: "#1c1c1e", marginBottom: 20, marginTop: 4 }}>
        Records
      </Text>
      {items.map(it => (
        <TouchableOpacity
          key={it.screen}
          onPress={() => navigation.navigate(it.screen)}
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            borderLeftWidth: 3,
            borderLeftColor: it.accent,
            shadowColor: "#1c1c1e",
            shadowOpacity: 0.06,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 26, marginRight: 14 }}>{it.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 15, color: "#1c1c1e" }}>
              {it.title}
            </Text>
            <Text style={{ fontFamily: "Lato_400Regular", fontSize: 12, color: "#8e8e98", marginTop: 2 }}>
              {it.sub}
            </Text>
          </View>
          <Text style={{ fontFamily: "Lato_700Bold", fontSize: 14, color: it.accent }}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Records Stack ────────────────────────────────────────────
function RecordsStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="RecordsHome" component={RecordsHome}
        options={{ title: "Records" }} />
      <Stack.Screen name="Activity" component={ActivityScreen}
        options={{ title: "Activity Log" }} />
      <Stack.Screen name="Progress" component={ProgressScreen}
        options={{ title: "Progress Reports" }} />
      <Stack.Screen name="Chats" component={ChatsScreen}
        options={{ title: "Chat History" }} />
      <Stack.Screen name="Notes" component={NotesScreen}
        options={{ title: "AI-Generated Notes" }} />
      <Stack.Screen name="StudyPlanner" component={StudyPlannerScreen}
        options={{ title: "Study Planner" }} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen}
        options={{ title: "Focus Timer" }} />
      <Stack.Screen name="MockTest" component={MockTestScreen}
        options={{ title: "Mock Tests" }} />
      <Stack.Screen name="Assignment" component={AssignmentScreen}
        options={{ title: "Assignments" }} />
    </Stack.Navigator>
  );
}

// ── Admin Stack ──────────────────────────────────────────────
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="AdminHome" component={AdminScreen}
        options={{ title: "Admin Panel" }} />
      <Stack.Screen name="AITutor" component={AITutorScreen}
        options={{ title: "AI Tutor" }} />
      <Stack.Screen name="Activity" component={ActivityScreen}
        options={{ title: "Activity Log" }} />
      <Stack.Screen name="Progress" component={ProgressScreen}
        options={{ title: "Progress Reports" }} />
    </Stack.Navigator>
  );
}

// ── AI Tutor Stack ───────────────────────────────────────────
function AITutorStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen name="AITutorHome" component={AITutorScreen}
        options={{ title: "AI Tutor" }} />
    </Stack.Navigator>
  );
}

// ── Main tabs ────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e4e1d8",
          height: 62,
          paddingBottom: 6,
          paddingTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab" component={DashboardStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="StudentsTab" component={StudentsStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👨‍🎓" label="Students" focused={focused} /> }}
      />
      <Tab.Screen
        name="RecordsTab" component={RecordsStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Records" focused={focused} /> }}
      />
      <Tab.Screen
        name="AdminTab" component={AdminStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🛡" label="Admin" focused={focused} /> }}
      />
      <Tab.Screen
        name="AITutorTab" component={AITutorStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🤖" label="AI Tutor" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
    SourceCodePro_400Regular,
    SourceCodePro_600SemiBold,
  });

  // Show custom splash while fonts load
  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={{ flex: 1 }}>
      <DataProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#0f2d5c" />
        {/* 4px navy accent stripe across the very top */}
        <View style={{ height: 4, backgroundColor: "#0f2d5c" }} />
        <View style={{ flex: 1 }}>
          <NavigationContainer>
            <MainTabs />
          </NavigationContainer>
        </View>
      </DataProvider>
    </SafeAreaProvider>
  );
}
