import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { OnboardingScreen } from "@/components/onboarding-screen";

export default function OnboardingRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor="#FFFFFF" style="dark" />
      <OnboardingScreen />
    </>
  );
}
