import { useTheme } from "@react-navigation/native";
import { Pressable, PressableProps } from "react-native";
import { store$ } from "../store";
import { observer } from "@legendapp/state/react";
import { ThemedText } from "./ThemedText";
import * as Haptics from "expo-haptics";
import { iOSColors } from "react-native-typography";

export const NumberButton = observer(function NumberButton({
  children: num,
  ...props
}: PressableProps & {
  children: number;
}) {
  const { colors, dark } = useTheme();
  const gameStatus = store$.status.get();
  const cellSelected = store$.cellSelected.get();
  const controlsDisabled = !cellSelected;
  const numberComplete = store$.isNumberComplete(num);
  const mode = store$.mode.get();
  const highlighted = store$.cellsHighlighted.get() === num;
  const disabled =
    gameStatus === "complete"
      ? true
      : mode === "notes" && cellSelected
      ? false
      : controlsDisabled || numberComplete;
  const cellSelectedNotes = cellSelected
    ? store$.board[cellSelected[0]][cellSelected[1]].notes.get()
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
        mode === "notes" && cellSelectedNotes && cellSelectedNotes.includes(num)
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
        highlighted
          ? {
              borderColor: iOSColors.green,
            }
          : undefined,
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
        if (disabled) return;
        switch (mode) {
          case "normal":
            store$.setValue(cellSelected, num);
            break;
          case "notes":
            store$.toggleNote(cellSelected, num);
            break;
        }
        Haptics.selectionAsync();
      }}
      onLongPress={() => {
        if (highlighted) {
          store$.setHighlighted(0);
        } else {
          store$.setHighlighted(num);
        }
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
