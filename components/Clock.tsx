import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { $clock } from "../clock";
import { ThemedText } from "../components/ThemedText";

export const Clock = observer(function Clock() {
  const { dark } = useTheme();
  const time = $clock.time.get();
  const status = $clock.status.get();

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === "running") {
        $clock.tick();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [status]);

  return (
    <ThemedText
      style={{
        textAlign: "center",
        fontWeight: "600",
        color: dark ? "#FFF" : "#555",
      }}
    >
      {time}
    </ThemedText>
  );
});
