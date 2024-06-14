import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { iOSColors } from "react-native-typography";
import { CellCoords } from "../store";
import { Row } from "./Row";
import { Cell } from "./Cell";

export function Box({
  values,
  startingCoords,
}: {
  values: number[][];
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
        borderColor: dark ? iOSColors.gray : iOSColors.midGray,
        padding: 4,
        gap: 4,
      }}
    >
      {values.map((row, rowIndex) => (
        <Row key={rowIndex}>
          {row.map((num, colIndex) => {
            return (
              <Cell
                key={colIndex}
                coords={[rowIndex + rowCoord, colIndex + colCoord]}
              >
                {num}
              </Cell>
            );
          })}
        </Row>
      ))}
    </View>
  );
}
