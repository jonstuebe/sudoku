import { Motion } from "@legendapp/motion";
import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { View } from "react-native";
import { iOSColors } from "react-native-typography";
import { CellCoords, store$ } from "../store";
import { getNotesArray } from "../utils";

function isInPressedRowOrColumn({
  coords,
  selected,
  pressedCoords,
}: {
  coords: CellCoords;
  selected: boolean;
  pressedCoords?: CellCoords;
}) {
  if (pressedCoords === undefined) return false;
  if (selected) return true;

  const [row, column] = coords;
  const [selectedRow, selectedColumn] = pressedCoords;

  return row === selectedRow || column === selectedColumn;
}

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
  const showErrors = store$.showErrors.get();

  const pressedCoords = store$.cellPressed.get();
  const highlightRowColumnEnabled = store$.highlightRowColumn.get();
  const inSelectedRowOrColumn = useMemo(() => {
    if (highlightRowColumnEnabled === false) return false;
    return isInPressedRowOrColumn({ coords, selected, pressedCoords });
  }, [coords, selected, pressedCoords, highlightRowColumnEnabled]);

  return (
    <Motion.Pressable
      style={{
        flex: 1,
        aspectRatio: 1,
      }}
      onPress={() => {
        store$.cellPressed.set(coords);

        if (editable) {
          store$.setSelected(coords);

          if (value !== 0) {
            if (highlighted) {
              store$.setHighlighted(0);
            } else {
              store$.setHighlighted(value);
            }
          }
        } else {
          if (highlighted) {
            store$.setHighlighted(0);
          } else {
            store$.setHighlighted(value);
          }
        }

        Haptics.selectionAsync();
      }}
    >
      <Motion.View
        style={[
          {
            aspectRatio: 1,
            borderRadius: 8,
            borderWidth: 2,
            borderColor:
              !valid && value && showErrors
                ? colors.notification
                : highlighted
                ? iOSColors.green
                : selected
                ? colors.primary
                : inSelectedRowOrColumn
                ? colors.border
                : colors.card,
            flex: 1,
            backgroundColor: inSelectedRowOrColumn
              ? colors.border
              : colors.card,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        {value !== 0 ? (
          <Motion.Text
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: editable ? 1 : 0.6,
            }}
            transition={{
              opacity: {
                type: "timing",
                duration: 250,
              },
            }}
            style={[
              {
                color: colors.text,
                // opacity: editable ? 1 : 0.6,
                fontSize: 20,
                lineHeight: 24,
                fontWeight: "bold",
              },
            ]}
          >
            {value}
          </Motion.Text>
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
                      <Motion.Text
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
                      </Motion.Text>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}
      </Motion.View>
    </Motion.Pressable>
  );
});
