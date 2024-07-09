import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { iOSUIKit } from "react-native-typography";
import Button from "../components/Button";
import { ThemedText } from "../components/ThemedText";
import { store$ } from "../store";

export default observer(function PausedScreen() {
  const { colors, dark } = useTheme();

  return (
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
        Game Paused
      </ThemedText>
      <Button
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          store$.resumeGame();
        }}
      >
        Continue
      </Button>
    </BlurView>
  );
});
