import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";
import { iOSColors } from "react-native-typography";
import { ThemedText } from "../components/ThemedText";
import { $store, CellCoords } from "../store";
import { chunkArray, getNotesArray } from "../utils";

export const Cell = observer(function Cell({
  coords,
  value,
  highlighted,
  selected,
  valid,
  editable,
  notes,
}: {
  coords: CellCoords;
  value: number;
  highlighted: boolean;
  selected: boolean;
  valid: boolean;
  editable: boolean;
  notes: number[];
}) {
  const { colors } = useTheme();
  const showErrors = $store.showErrors.get();

  return (
    <Pressable
      style={({ pressed }) => [
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
        selected
          ? {
              borderColor: colors.primary,
            }
          : undefined,
        highlighted
          ? {
              borderColor: iOSColors.green,
            }
          : undefined,
        !valid && value && showErrors
          ? {
              borderColor: colors.notification,
            }
          : undefined,
      ]}
      onPress={() => {
        if (editable) {
          $store.setSelected(coords);

          if (value !== 0) {
            if (highlighted) {
              $store.setHighlighted(0);
            } else {
              $store.setHighlighted(value);
            }
          }
        } else {
          if (highlighted) {
            $store.setHighlighted(0);
          } else {
            $store.setHighlighted(value);
          }
        }

        Haptics.selectionAsync();
      }}
    >
      {value !== 0 ? (
        <ThemedText
          style={[
            {
              color: colors.text,
              opacity: editable ? 1 : 0.6,
              fontSize: 20,
              lineHeight: 24,
              fontWeight: "bold",
            },
          ]}
        >
          {value}
        </ThemedText>
      ) : (
        <View>
          {getNotesArray(notes).map((chunk, chunkIndex) => {
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
                          opacity: note === 0 ? 0 : 1,
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
