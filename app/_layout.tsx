import { useColorScheme } from "@/hooks/useColorScheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActionSheetIOS, Pressable } from "react-native";

import "react-native-reanimated";

import { games$ } from "../games";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="paused"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="completed"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="games"
          options={{
            title: "Past Games",
            presentation: "modal",
            headerLeft(props) {
              return (
                <Pressable
                  onPress={() => {
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        options: ["Cancel", "Delete Past Games"],
                        cancelButtonIndex: 0,
                        destructiveButtonIndex: 1,
                      },
                      (index) => {
                        if (index === 1) {
                          games$.games.set([]);
                          AsyncStorage.removeItem("games");
                          router.canDismiss() && router.back();
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Medium
                          );
                        }
                      }
                    );
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={props.tintColor}
                  />
                </Pressable>
              );
            },
            headerRight(props) {
              return (
                <Pressable onPress={() => router.canDismiss() && router.back()}>
                  <Ionicons
                    name="close-outline"
                    size={24}
                    color={props.tintColor}
                  />
                </Pressable>
              );
            },
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
