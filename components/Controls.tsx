import Icon from "@expo/vector-icons/Ionicons";
import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { Pressable, View } from "react-native";
import { $store } from "../store";
import { Row } from "./Row";
import { NumberButton } from "./NumberButton";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import * as Haptics from "expo-haptics";

export const Controls = observer(function Controls() {
  const { colors } = useTheme();
  const cellSelected = $store.cellSelected.get();
  const cellSelectedValue = cellSelected
    ? $store.board.get()[cellSelected[0]]?.[cellSelected[1]]
    : undefined;

  const mode = $store.mode.get();

  return (
    <View style={{ gap: 8 }}>
      <SegmentedControl
        selectedIndex={mode === "notes" ? 1 : 0}
        values={["Normal", "Notes"]}
        onValueChange={(value) =>
          $store.mode.set(value.toLowerCase() as "normal" | "notes")
        }
      />
      <Row gap={4}>
        <NumberButton>{1}</NumberButton>
        <NumberButton>{2}</NumberButton>
        <NumberButton>{3}</NumberButton>
        <NumberButton>{4}</NumberButton>
        <NumberButton>{5}</NumberButton>
      </Row>
      <Row gap={4}>
        <NumberButton>{6}</NumberButton>
        <NumberButton>{7}</NumberButton>
        <NumberButton>{8}</NumberButton>
        <NumberButton>{9}</NumberButton>
        <Pressable
          style={({ pressed }) => [
            {
              aspectRatio: 5 / 3,
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              opacity:
                mode === "notes" ? 0.5 : pressed && cellSelected ? 0.85 : 1,
            },
            !cellSelected
              ? {
                  opacity: 0.5,
                }
              : undefined,
          ]}
          disabled={mode === "notes" ? true : !cellSelected}
          onPress={() => {
            $store.clearSelectedCell();
            Haptics.selectionAsync();
          }}
          hitSlop={8}
        >
          <Icon name="backspace" color={colors.text} size={28} />
        </Pressable>
      </Row>
    </View>
  );
});
