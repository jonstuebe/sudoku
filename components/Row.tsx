import { ReactNode } from "react";
import { View } from "react-native";

export function Row({
  children,
  gap = 2,
}: {
  children: ReactNode;
  gap?: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap,
      }}
    >
      {children}
    </View>
  );
}
