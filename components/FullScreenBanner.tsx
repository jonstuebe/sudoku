import { Motion } from "@legendapp/motion";
import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { View } from "react-native";
import { iOSColors, iOSUIKit } from "react-native-typography";
import Confetti from "react-native-confetti";

import { clock$ } from "../clock";
import { store$ } from "../store";
import Button from "./Button";
import { ThemedText } from "./ThemedText";
import { RefObject, useEffect, useRef } from "react";

export const FullScreenBanner = observer(function FullScreenBanner() {
  const { colors, dark } = useTheme();
  const clockStatus = clock$.status.get();
  const gameStatus = store$.status.get();
  const confettiRef = useRef<Confetti>();

  useEffect(() => {
    if (gameStatus === "complete") {
      confettiRef.current?.startConfetti();
    }
  }, [gameStatus, confettiRef]);

  if (clockStatus === "running") {
    return null;
  }

  return (
    <>
      <Motion.View
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          type: "timing",
          duration: 250,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <BlurView
          intensity={10}
          style={{
            flex: 1,
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
            {store$.status.get() === "playing" ? "Game Paused" : "You Won!"}
          </ThemedText>
          {store$.status.get() === "playing" ? (
            <Button
              onPress={() => {
                clock$.resume();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              Resume
            </Button>
          ) : (
            <View
              style={{
                gap: 8,
              }}
            >
              <Button
                onPress={() => {
                  store$.newGame();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                New Game
              </Button>
              <Button
                variation="outline"
                color={iOSColors.midGray}
                onPress={() => router.push("games")}
              >
                View Past Games
              </Button>
              <ThemedText
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {store$.numMoves.get()} moves in {clock$.time.get()}
              </ThemedText>
            </View>
          )}
        </BlurView>
      </Motion.View>
      <Confetti duration={3000} ref={confettiRef as RefObject<Confetti>} />
    </>
  );
});
