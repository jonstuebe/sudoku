import { observer } from "@legendapp/state/react";
import { $store } from "../store";
import { Balloons, Hearts, PopperHandler, Stars } from "react-native-fiesta";
import { iOSColors } from "react-native-typography";
import { useEffect, useRef } from "react";

const theme: string[] = [
  // iOSColors.blue,
  // iOSColors.green,
  // iOSColors.yellow,
  // iOSColors.red,
  // iOSColors.orange,
  // iOSColors.purple,
  // iOSColors.red,

  iOSColors.pink,
  iOSColors.pink,
  iOSColors.purple,
];

export const WinningAnimation = observer(function WinningAnimation() {
  const winningAnimation = $store.winningAnimation.get();
  const finishedAt = $store.finishedAt.get();
  const ref = useRef<PopperHandler>(null);

  useEffect(() => {
    if (finishedAt) {
      ref.current?.start();
    }
  }, [finishedAt]);

  switch (winningAnimation) {
    case "Balloons":
      return <Balloons autoPlay={false} theme={theme} ref={ref} />;
    case "Hearts":
      return <Hearts autoPlay={false} theme={theme} ref={ref} />;
    case "Stars":
      return <Stars autoPlay={false} theme={theme} ref={ref} />;
  }
});
