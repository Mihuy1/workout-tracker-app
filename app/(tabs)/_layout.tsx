import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { NativeTabs } from "expo-router/native-tabs";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NativeTabs
      tintColor={Colors[colorScheme].tint}
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" md="history" />
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="statistics">
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
        <NativeTabs.Trigger.Label>Statistics</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
    // <Tabs
    //   screenOptions={{
    //     tabBarActiveTintColor: Colors[colorScheme].tint,
    //     headerShown: false,
    //     tabBarButton: HapticTab,
    //     tabBarStyle:
    //       colorScheme === "dark" ? { backgroundColor: "#000" } : undefined,
    //   }}
    // >
    //   <Tabs.Screen
    //     name="index"
    //     options={{
    //       title: "Home",
    //       tabBarIcon: ({ color }) => (
    //         <IconSymbol size={28} name="house.fill" color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="history"
    //     options={{
    //       title: "History",
    //       tabBarIcon: ({ color }) => (
    //         <IconSymbol size={28} name="clock.arrow.circlepath" color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="statistics"
    //     options={{
    //       title: "Statistics",
    //       tabBarIcon: ({ color }) => (
    //         <IconSymbol size={28} name="chart.bar.fill" color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="settings"
    //     options={{
    //       title: "Settings",
    //       tabBarIcon: ({ color }) => (
    //         <IconSymbol size={28} name="gear" color={color} />
    //       ),
    //     }}
    //   />
    // </Tabs>
  );
}
