import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { AppState, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { iOSColors, iOSUIKit } from "react-native-typography";
import * as Haptics from "expo-haptics";

import { $clock } from "../clock";
import { Board } from "../components/Board";
import Button from "../components/Button";
import { Controls } from "../components/Controls";
import { Header } from "../components/Header";
import { ThemedText } from "../components/ThemedText";
import { $store } from "../store";
import { Motion } from "@legendapp/motion";
import { FullScreenBanner } from "../components/FullScreenBanner";

export default observer(function Game() {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const gameStatus = $store.status.get();

  useFocusEffect(
    useCallback(() => {
      if (gameStatus === "playing") {
        $clock.resume();
      }

      return () => {
        $clock.pause();
      };
    }, [gameStatus])
  );

  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        $clock.pause();
      } else if (gameStatus === "playing") {
        $clock.resume();
      }
    });

    return () => {
      listener.remove();
    };
  }, [gameStatus]);

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <SafeAreaView
        style={{
          padding: 8,
          paddingBottom: insets.bottom > 0 ? 0 : 8,
          justifyContent: "space-between",
          flex: 1,
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Header />
        <View style={{ gap: 16 }}>
          <Board />
          <Controls />
        </View>
        <View />
      </SafeAreaView>
      <FullScreenBanner />
    </View>
  );
});
