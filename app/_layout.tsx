import "../global.css";

import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
  });

  const [hydrated, setHydrated] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const segments = useSegments();
  const router = useRouter();

  // Wait for auth store to hydrate from AsyncStorage
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

  // Handle redirects reactively
  useEffect(() => {
    if (!loaded || !hydrated) return;

    const inAuthGroup = segments[0] === "(auth)" || segments[0] === "onboarding";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/onboarding");
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/");
    }
  }, [isLoggedIn, segments, loaded, hydrated]);

  useEffect(() => {
    if ((loaded || error) && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, hydrated]);

  if ((!loaded && !error) || !hydrated) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

