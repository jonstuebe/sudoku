import { observer } from "@legendapp/state/react";
import { View } from "react-native";
import { $store } from "../store";
import { getBoxByCoords } from "../utils";
import { Box } from "./Box";

export const Board = observer(function Board() {
  const values = $store.board.get();

  return (
    <View
      style={{
        gap: 4,
      }}
    >
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Box startingCoords={[0, 0]} values={getBoxByCoords(values, [0, 0])} />
        <Box startingCoords={[0, 3]} values={getBoxByCoords(values, [0, 3])} />
        <Box startingCoords={[0, 6]} values={getBoxByCoords(values, [0, 6])} />
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Box startingCoords={[3, 0]} values={getBoxByCoords(values, [3, 0])} />
        <Box startingCoords={[3, 3]} values={getBoxByCoords(values, [3, 3])} />
        <Box startingCoords={[3, 6]} values={getBoxByCoords(values, [3, 6])} />
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <Box startingCoords={[6, 0]} values={getBoxByCoords(values, [6, 0])} />
        <Box startingCoords={[6, 3]} values={getBoxByCoords(values, [6, 3])} />
        <Box startingCoords={[6, 6]} values={getBoxByCoords(values, [6, 6])} />
      </View>
    </View>
  );
});
