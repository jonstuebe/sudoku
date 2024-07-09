import { useTheme } from "@react-navigation/native";
import { View, ViewStyle } from "react-native";
import { iOSColors } from "react-native-typography";
import { CellCoords } from "../store";
import { Row } from "./Row";
import { Cell } from "./Cell";
import { Cell as CellType } from "../types";

const cornerMatrix: { coords: CellCoords; style: ViewStyle }[] = [
  {
    coords: [0, 0],
    style: {
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderTopLeftRadius: 8,
    },
  },
  {
    coords: [0, 3],
    style: {
      borderTopWidth: 2,
    },
  },
  {
    coords: [0, 6],
    style: {
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderTopRightRadius: 8,
    },
  },
  {
    coords: [3, 0],
    style: {
      borderLeftWidth: 2,
    },
  },
  {
    coords: [3, 6],
    style: {
      borderRightWidth: 2,
    },
  },
  {
    coords: [6, 0],
    style: {
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderBottomLeftRadius: 8,
    },
  },
  {
    coords: [6, 3],
    style: {
      borderBottomWidth: 2,
    },
  },
  {
    coords: [6, 6],
    style: {
      borderRightWidth: 2,
      borderBottomWidth: 2,
      borderBottomRightRadius: 8,
    },
  },
];

export function Box({
  values,
  startingCoords,
}: {
  values: CellType[][];
  startingCoords: CellCoords;
}) {
  const { dark } = useTheme();
  const [rowCoord, colCoord] = startingCoords;
  const cornerStyle = cornerMatrix.find(
    ({ coords }) => coords[0] === rowCoord && coords[1] === colCoord
  )?.style;

  return (
    <View
      style={[
        {
          flex: 1,
          borderWidth: 1,
          borderRadius: 0,
          borderColor: dark ? iOSColors.gray : iOSColors.lightGray,
          padding: 2,
          gap: 2,
        },
        cornerStyle,
      ]}
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
