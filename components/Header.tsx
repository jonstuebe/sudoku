import Icon from "@expo/vector-icons/Ionicons";
import { MenuView } from "@react-native-menu/menu";
import { useTheme } from "@react-navigation/native";
import { ActionSheetIOS, Pressable, View } from "react-native";
import { $store } from "../store";
import { Difficulty, WinningAnimation } from "../types";
import { Clock } from "./Clock";
import * as Haptics from "expo-haptics";
import { observer } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { $games } from "../games";
import { iOSColors } from "react-native-typography";

export const Header = observer(function Header() {
  const { colors, dark } = useTheme();
  const router = useRouter();
  const hasPastGames = $games.games.get().length === 0;
  const difficulty = $store.difficulty.get();

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
        <Pressable
          onPress={() => {
            $store.showErrors.set(!$store.showErrors.get());
          }}
        >
          <Icon
            name="alert-circle-outline"
            size={24}
            color={
              $store.showErrors.get() ? iOSColors.red : dark ? "#FFF" : "#777"
            }
          />
        </Pressable>
        <Pressable
          disabled={hasPastGames}
          onPress={() => {
            router.push("/games");
          }}
          style={{
            opacity: hasPastGames ? 0.5 : 1,
          }}
        >
          <Icon name="time-outline" size={24} color={dark ? "#FFF" : "#777"} />
        </Pressable>
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
        <Pressable
          onPress={() => {
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: ["Cancel", "Reset Game"],
                cancelButtonIndex: 0,
                destructiveButtonIndex: 1,
              },
              (index) => {
                if (index === 1) {
                  $store.resetBoard();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }
            );
          }}
        >
          <Icon
            name="refresh-circle-outline"
            size={24}
            color={iOSColors.orange}
          />
        </Pressable>
        <MenuView
          actions={[
            {
              id: "easy",
              title: "Easy",
              state: difficulty === "easy" ? "on" : "off",
            },
            {
              id: "medium",
              title: "Medium",
              state: difficulty === "medium" ? "on" : "off",
            },
            {
              id: "hard",
              title: "Hard",
              state: difficulty === "hard" ? "on" : "off",
            },
          ]}
          onPressAction={({ nativeEvent: { event: id } }) => {
            $store.newGame(id as Difficulty);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Icon size={24} name="add-circle" color={colors.primary} />
        </MenuView>
      </View>
    </View>
  );
});
