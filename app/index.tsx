import { observer } from "@legendapp/state/react";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { AppState, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { clock$ } from "../clock";
import { Board } from "../components/Board";
import { Controls } from "../components/Controls";
import { FullScreenBanner } from "../components/FullScreenBanner";
import { Header } from "../components/Header";
import { store$ } from "../store";

export default observer(function Game() {
  const insets = useSafeAreaInsets();
  const gameStatus = store$.status.get();

  useFocusEffect(
    useCallback(() => {
      if (gameStatus === "playing") {
        clock$.resume();
      }

      return () => {
        clock$.pause();
      };
    }, [gameStatus])
  );

  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        clock$.pause();
      } else if (gameStatus === "playing") {
        clock$.resume();
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
