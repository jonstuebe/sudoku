import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { iOSColors, iOSUIKit } from "react-native-typography";
import { clock$ } from "../clock";
import Button from "../components/Button";
import { VStack } from "../components/Stack";
import { ThemedText } from "../components/ThemedText";
import { store$ } from "../store";
import Confetti from "react-native-confetti";
import { RefObject, useEffect, useRef } from "react";
import { games$ } from "../games";

export default observer(function CompletedScreen() {
  const { colors, dark } = useTheme();
  const router = useRouter();
  const game = games$.games.get().at(-1);
  const confettiRef = useRef<Confetti>();

  useEffect(() => {
    confettiRef.current?.startConfetti();
  }, [confettiRef]);

  return (
    <>
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
              letterSpacing: -0.5,
            },
          ]}
        >
          You Won!
        </ThemedText>
        <VStack spacing={8}>
          <Button
            onPress={() => {
              store$.newGame();
              router.back();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            New Game
          </Button>
          <Button
            variation="outline"
            color={iOSColors.midGray}
            onPress={() => {
              router.replace("games");

              store$.newGame();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            View Past Games
          </Button>
          <ThemedText
            style={{
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {game?.numMoves} moves in {game?.time}
          </ThemedText>
        </VStack>
      </BlurView>
      <Confetti duration={3000} ref={confettiRef as RefObject<Confetti>} />
    </>
  );
});
