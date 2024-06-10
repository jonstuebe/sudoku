import Icon from "@expo/vector-icons/Ionicons";
import { MenuView } from "@react-native-menu/menu";
import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { $store } from "../store";
import { Difficulty } from "../types";
import { Clock } from "./Clock";
import * as Haptics from "expo-haptics";
import { observer } from "@legendapp/state/react";

export const Header = observer(function Header() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 8,
          flex: 1 / 3,
        }}
      >
        <MenuView
          onPressAction={({ nativeEvent: { event: id } }) => {
            switch (id) {
              case "reset":
                $store.resetBoard();
                break;
              case "displayErrors":
                $store.showErrors.set(!$store.showErrors.get());
                break;
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          actions={[
            {
              id: "reset",
              title: "Reset Game",
            },
            {
              id: "displayErrors",
              title: "Show Errors",
              state: $store.showErrors.get() ? "on" : "off",
            },
          ]}
        >
          <Icon
            name="ellipsis-horizontal-circle"
            size={30}
            color={colors.text}
          />
        </MenuView>
      </View>
      <View
        style={{
          flex: 1 / 3,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Clock />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 8,
          flex: 1 / 3,
        }}
      >
        <MenuView
          actions={[
            {
              id: "easy",
              title: "Easy",
            },
            {
              id: "medium",
              title: "Medium",
            },
            {
              id: "hard",
              title: "Hard",
            },
          ]}
          onPressAction={({ nativeEvent: { event: id } }) => {
            $store.newGame(id as Difficulty);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Icon size={30} name="add-circle" color={colors.primary} />
        </MenuView>
      </View>
    </View>
  );
});
