import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from "posthog-react-native";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const posthogHost =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

const splashScreenRegistration = SplashScreen.preventAutoHideAsync()
  .then(() => true)
  .catch(() => false);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    void splashScreenRegistration.then((isRegistered) => {
      if (!isRegistered) return;

      try {
        SplashScreen.hide();
      } catch {
        // Fast Refresh may run after the native splash screen has been removed.
      }
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return posthogApiKey ? (
    <PostHogProvider
      apiKey={posthogApiKey}
      options={{
        host: posthogHost,
      }}
    >
      <SafeAreaProvider>
        <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
          <SubscriptionProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SubscriptionProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </PostHogProvider>
  ) : (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
        <SubscriptionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SubscriptionProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
