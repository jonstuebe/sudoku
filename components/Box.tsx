import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { iOSColors } from "react-native-typography";
import { CellCoords } from "../store";
import { Row } from "./Row";
import { Cell } from "./Cell";
import { Cell as CellType } from "../types";

export function Box({
  values,
  startingCoords,
}: {
  values: CellType[][];
  startingCoords: CellCoords;
}) {
  const { dark } = useTheme();
  const [rowCoord, colCoord] = startingCoords;

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 2,
        borderRadius: 8,
        borderColor: dark ? iOSColors.gray : iOSColors.lightGray,
        padding: 4,
        gap: 4,
      }}
    >
      {values.map((row, rowIndex) => (
        <Row key={rowIndex}>
          {row.map((cell, colIndex) => {
            return (
              <Cell
                key={colIndex}
                coords={[rowIndex + rowCoord, colIndex + colCoord]}
                value={cell.value}
                highlighted={cell.highlighted}
                selected={cell.selected}
                valid={cell.valid}
                editable={cell.editable}
                notes={cell.notes}
              />
            );
          })}
        </Row>
      ))}
    </View>
  );
}
