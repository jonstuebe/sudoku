import { observable } from "@legendapp/state";
import { $clock, Clock } from "./clock";

describe("$clock", () => {
  it("ticks properly", () => {
    const clock = observable<Clock>($clock);

    expect(clock.peek().hours).toBe(0);
    expect(clock.peek().minutes).toBe(0);
    expect(clock.peek().seconds).toBe(0);
    expect(clock.peek().status).toBe("running");

    clock.tick();

    expect(clock.peek().hours).toBe(0);
    expect(clock.peek().minutes).toBe(0);
    expect(clock.peek().seconds).toBe(1);
    expect(clock.peek().status).toBe("running");

    for (let i = 0; i < 59; i++) {
      clock.tick();
    }

    expect(clock.peek().hours).toBe(0);
    expect(clock.peek().minutes).toBe(1);
    expect(clock.peek().seconds).toBe(0);
    expect(clock.peek().status).toBe("running");
  });
});
