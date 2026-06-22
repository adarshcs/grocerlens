import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExpenseProvider } from "@/context/ExpenseContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    function handleUrl({ url }: { url: string }) {
      // Match grocerlens://join/CODE or any URL containing /join/CODE or ?code=CODE
      const match =
        url.match(/[/=]join[/=?]([A-Za-z0-9]{4,8})/i) ||
        url.match(/code[=:]([A-Za-z0-9]{4,8})/i);
      if (match) {
        router.push(`/join?code=${match[1].toUpperCase()}`);
      }
    }

    Linking.getInitialURL()
      .then((url) => { if (url) handleUrl({ url }); })
      .catch(() => {});

    const sub = Linking.addEventListener("url", handleUrl);
    return () => sub.remove();
  }, [router]);

  return null;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="bill/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="join"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <ExpenseProvider>
                <DeepLinkHandler />
                <RootLayoutNav />
              </ExpenseProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
