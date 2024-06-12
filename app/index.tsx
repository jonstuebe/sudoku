import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Header } from "../components/Header";
import { Board } from "../components/Board";
import { Controls } from "../components/Controls";
import { View } from "react-native";
import { WinningAnimation } from "../components/WinningAnimation";

export default function Game() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <WinningAnimation />
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
}
