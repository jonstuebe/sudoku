import { observer } from "@legendapp/state/react";
import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";
import { ThemedText } from "../components/ThemedText";
import { $store } from "../store";
import { useTheme } from "@react-navigation/native";

export const Clock = observer(function Clock() {
  const { dark } = useTheme();
  const [text, setText] = useState("");
  const startedAt = $store.startedAt.get();

  useEffect(() => {
    const interval = setInterval(() => {
      if (startedAt) {
        const now = new Date();
        const seconds = differenceInSeconds(now, startedAt);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours === 0) {
          setText(
            `${String(minutes % 60).padStart(2, "0")}:${String(
              seconds % 60
            ).padStart(2, "0")}`
          );
        } else {
          setText(
            `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(
              2,
              "0"
            )}:${String(seconds % 60).padStart(2, "0")}`
          );
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <ThemedText
      style={{
        textAlign: "center",
        fontWeight: "600",
        color: dark ? "#FFF" : "#555",
      }}
    >
      {text}
    </ThemedText>
  );
});
