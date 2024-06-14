import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { Pressable, PressableProps, TextStyle, View } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { $store, CellCoords } from "../store";
import { chunkArray } from "../utils";
import * as Haptics from "expo-haptics";
import { iOSColors } from "react-native-typography";
import { useEffect, useMemo } from "react";

export const Cell = observer(function Cell({
  children: num,
  style,
  textStyle,
  coords,
  ...props
}: Omit<PressableProps, "onPress" | "disabled"> & {
  children: number;
  textStyle?: Pick<TextStyle, "fontSize" | "lineHeight">;
  coords: CellCoords;
}) {
  const { colors } = useTheme();
  const selectedCell = $store.selectedCell.get();
  const isHighlighted = $store.isCellHighlighted(coords);
  const isSelected =
    selectedCell &&
    selectedCell[0] === coords[0] &&
    selectedCell[1] === coords[1];
  const showErrors = $store.showErrors.get();
  const isValid = !showErrors ? true : $store.isCellValid(coords);
  const isEditable = $store.isCellEditable(coords);
  const notes = $store.notes.get().get(coords) ?? [];

  return (
    <Pressable
      style={(state) => [
        {
          aspectRatio: 1,
          borderRadius: 8,
          borderWidth: 2,
          flex: 1,
          backgroundColor: colors.card,
          borderColor: colors.card,
          justifyContent: "center",
          alignItems: "center",
        },
        isSelected
          ? {
              borderColor: colors.primary,
            }
          : undefined,
        !isValid && num
          ? {
              borderColor: colors.notification,
            }
          : undefined,
        isHighlighted
          ? {
              borderColor: iOSColors.green,
            }
          : undefined,
        typeof style === "function" ? style(state) : style,
      ]}
      onPress={() => {
        if (isEditable) {
          $store.setSelected(coords);
        } else {
          $store.displayNumber(num);
        }
        Haptics.selectionAsync();
      }}
      {...props}
    >
      {num !== 0 ? (
        <ThemedText
          style={[
            {
              color: colors.text,
              opacity: isEditable ? 1 : 0.6,
              fontSize: 20,
              lineHeight: 24,
              fontWeight: "bold",
            },
            textStyle,
          ]}
        >
          {num}
        </ThemedText>
      ) : (
        <View>
          {chunkArray(notes, 3).map((chunk, chunkIndex) => {
            return (
              <View
                key={chunkIndex}
                style={{
                  flexDirection: "row",
                }}
              >
                {chunk.map((note, idx) => {
                  return (
                    <ThemedText
                      key={idx}
                      style={[
                        {
                          textAlign: "center",
                          color: colors.text,
                          fontSize: 9,
                          lineHeight: 10,
                          fontWeight: "500",
                        },
                      ]}
                    >
                      {note}
                    </ThemedText>
                  );
                })}
              </View>
            );
          })}
        </View>
      )}
    </Pressable>
  );
});
