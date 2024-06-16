import { observable } from "@legendapp/state";
import { AppState } from "react-native";

export type Clock = {
  hours: number;
  minutes: number;
  seconds: number;
  status: "paused" | "running";
  time: string;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  reset: () => void;
};

const pad = (num: number): string => String(num).padStart(2, "0");

export const clock$ = observable<Clock>({
  hours: 0,
  minutes: 0,
  seconds: 0,
  status: "running",
  time: () => {
    const hours: number = clock$.hours.get();
    const minutes: number = clock$.minutes.get();
    const seconds: number = clock$.seconds.get();

    if (hours === 0) {
      return `${pad(minutes)}:${pad(seconds)}`;
    }

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  },
  resume: () => {
    clock$.status.set("running");
  },
  pause: () => {
    clock$.status.set("paused");
  },
  tick: () => {
    let seconds = clock$.seconds.peek();
    let minutes = clock$.minutes.peek();
    let hours = clock$.hours.peek();

    seconds++;

    if (seconds > 59) {
      seconds = 0;
      minutes++;
    }

    if (minutes > 59) {
      minutes = 0;
      hours++;
    }

    clock$.hours.set(hours);
    clock$.minutes.set(minutes);
    clock$.seconds.set(seconds);
  },
  reset: () => {
    clock$.hours.set(0);
    clock$.minutes.set(0);
    clock$.seconds.set(0);
  },
});
