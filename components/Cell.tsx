import { observer } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";
import { iOSColors } from "react-native-typography";
import { ThemedText } from "../components/ThemedText";
import { store$, CellCoords } from "../store";
import { chunkArray, getNotesArray } from "../utils";
import { Motion } from "@legendapp/motion";
import { useMemo } from "react";

function isInSelectedRowOrColumn({
  coords,
  selected,
  selectedCoords,
}: {
  coords: CellCoords;
  selected: boolean;
  selectedCoords?: CellCoords;
}) {
  if (selectedCoords === undefined) return false;
  if (selected) return true;

  const [row, column] = coords;
  const [selectedRow, selectedColumn] = selectedCoords;

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

  const selectedCoords = store$.cellSelected.get();
  const highlightRowColumnEnabled = store$.highlightRowColumn.get();
  const inSelectedRowOrColumn = useMemo(() => {
    if (highlightRowColumnEnabled === false) return false;
    return isInSelectedRowOrColumn({ coords, selected, selectedCoords });
  }, [coords, selected, selectedCoords, highlightRowColumnEnabled]);

  return (
    <Motion.Pressable
      style={{
        flex: 1,
        aspectRatio: 1,
      }}
      onPress={() => {
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
