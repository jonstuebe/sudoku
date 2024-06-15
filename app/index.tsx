import { AppState, View } from "react-native";
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
import { ThemedText } from "../components/ThemedText";
import Button from "../components/Button";
import { iOSUIKit } from "react-native-typography";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";

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

  useEffect(() => {
    if (gameStatus === "complete") {
      router.push("games");
    }
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
      {$clock.status.get() === "paused" ? (
        <BlurView
          intensity={10}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            paddingHorizontal: 32,
            justifyContent: "center",
            gap: 8,
            backgroundColor: dark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
          }}
        >
          <ThemedText
            style={[
              iOSUIKit.largeTitleEmphasized,
              {
                textAlign: "center",
                color: colors.text,
              },
            ]}
          >
            Game Paused
          </ThemedText>
          <Button onPress={() => $clock.resume()}>Resume</Button>
        </BlurView>
      ) : null}
    </View>
  );
});
