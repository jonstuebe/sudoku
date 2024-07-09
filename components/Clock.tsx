import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { Pressable } from "react-native";
import { clock$ } from "../clock";
import { ThemedText } from "../components/ThemedText";
import { store$ } from "../store";

export const Clock = observer(function Clock() {
  const { dark } = useTheme();
  const time = clock$.time.get();
  const status = clock$.status.get();

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === "running") {
        clock$.tick();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [status]);

  return (
    <Pressable
      onPress={() => {
        store$.pauseGame();
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <ThemedText
        style={{
          textAlign: "center",
          fontWeight: "600",
          color: dark ? "#FFF" : "#555",
        }}
      >
        {time}
      </ThemedText>
    </Pressable>
  );
});
