import { useTheme } from "@react-navigation/native";
import { Pressable, PressableProps } from "react-native";
import { $store } from "../store";
import { observer } from "@legendapp/state/react";
import { ThemedText } from "./ThemedText";
import * as Haptics from "expo-haptics";

export const NumberButton = observer(function NumberButton({
  children: num,
  ...props
}: PressableProps & {
  children: number;
}) {
  const { colors, dark } = useTheme();
  const selectedCell = $store.selectedCell.get();
  const controlsDisabled = !selectedCell;
  const numberComplete = $store.isNumberComplete(num);
  const mode = $store.mode.get();
  const disabled =
    mode === "notes" && selectedCell
      ? false
      : controlsDisabled || numberComplete;
  const selectedCellNotes = selectedCell
    ? $store.notes.get().get(selectedCell)
    : [];

  return (
    <Pressable
      disabled={disabled}
      style={(state) => [
        {
          aspectRatio: 5 / 3,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.card,
          flex: 1,
          backgroundColor: colors.card,
          justifyContent: "center",
          alignItems: "center",
        },
        mode === "notes" && selectedCellNotes && selectedCellNotes.includes(num)
          ? {
              borderColor: colors.primary,
            }
          : undefined,
        state.pressed
          ? {
              borderColor: colors.primary,
              backgroundColor: colors.primary,
            }
          : undefined,
        {
          // disabled styles
          opacity: disabled ? 0.5 : 1,
        },
        !dark
          ? {
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,
            }
          : undefined,
      ]}
      onPress={() => {
        switch (mode) {
          case "normal":
            $store.setValue(selectedCell, num);
            break;
          case "notes":
            $store.toggleNote(selectedCell, num);
            break;
        }
        Haptics.selectionAsync();
      }}
      {...props}
    >
      {(state) => (
        <ThemedText
          style={{
            fontSize: 28,
            fontWeight: "bold",
            lineHeight: 32,
            color: state.pressed ? "#fff" : colors.text,
          }}
        >
          {num}
        </ThemedText>
      )}
    </Pressable>
  );
});
