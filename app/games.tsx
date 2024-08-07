import { observer } from "@legendapp/state/react";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useTheme } from "@react-navigation/native";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import { ScrollView, View } from "react-native";
import { clock$ } from "../clock";
import { VStack } from "../components/Stack";
import { ThemedText } from "../components/ThemedText";
import { games$ } from "../games";
import { Difficulty } from "../types";

const difficultyMatrix: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export default observer(function Games() {
  const { colors } = useTheme();
  const difficulty = games$.selectedDifficulty.get();
  const games = games$.sortedGames.get();

  useFocusEffect(() => {
    clock$.pause();

    return () => {
      clock$.resume();
    };
  });

  return (
    <View
      style={{
        flex: 1,
        marginTop: 8,
      }}
    >
      <SegmentedControl
        values={["Easy", "Hard"]}
        selectedIndex={difficultyMatrix[difficulty]}
        onValueChange={(value) => {
          games$.selectedDifficulty.set(value.toLowerCase() as Difficulty);
        }}
      />
      <ScrollView contentContainerStyle={{ gap: 8, marginTop: 8 }}>
        {games
          .filter((game) => game.difficulty === difficulty)
          .map((game, idx) => {
            return (
              <View
                key={idx}
                style={{
                  backgroundColor: colors.card,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <VStack>
                  <ThemedText>
                    {format(game.startedAt, "MM/dd/yyyy")}
                  </ThemedText>
                  <ThemedText>{game.time}</ThemedText>
                </VStack>
                <VStack>
                  <ThemedText>
                    <ThemedText style={{ fontWeight: "bold" }}>
                      Moves:
                    </ThemedText>{" "}
                    {game.numMoves}
                  </ThemedText>
                  <ThemedText>
                    <ThemedText style={{ fontWeight: "bold" }}>
                      Errors:
                    </ThemedText>{" "}
                    {game.numErrors}
                  </ThemedText>
                </VStack>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
});
