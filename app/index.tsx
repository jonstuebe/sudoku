import { AppState, Button, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Board } from "../components/Board";
import { Controls } from "../components/Controls";
import { Header } from "../components/Header";
import { useFocusEffect, useRouter } from "expo-router";
import { $store } from "../store";
import { observer } from "@legendapp/state/react";
import { useCallback, useEffect } from "react";
import { $clock } from "../clock";

export default observer(function Game() {
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

  useEffect(() => {
    if (gameStatus === "complete") {
      router.push("games");
    }
  }, [gameStatus]);

  return (
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
  );
});
