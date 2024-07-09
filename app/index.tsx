import { observer } from "@legendapp/state/react";
import { View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Board } from "../components/Board";
import { Controls } from "../components/Controls";
import { Header } from "../components/Header";

export default observer(function Game() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <SafeAreaView
        style={{
          padding: 8,
          paddingBottom: insets.bottom > 0 ? 0 : 8,
          justifyContent: "space-between",
          flex: 1,
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Header />
        <View style={{ gap: 16 }}>
          <Board />
          <Controls />
        </View>
        <View />
      </SafeAreaView>
    </View>
  );
});
