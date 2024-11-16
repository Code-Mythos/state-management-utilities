import { Computed } from "../src/computed";
import { StateManager } from "../src/state-manager";

describe("Computed", () => {
  let stateManager1: StateManager<number>;
  let stateManager2: StateManager<number>;

  beforeEach(() => {
    stateManager1 = new StateManager(1);
    stateManager2 = new StateManager(2);
  });

  test("should initialize with the correct value", () => {
    const computed = new Computed(
      () => stateManager1.value + stateManager2.value,
      [stateManager1, stateManager2]
    );
    expect(computed.value).toBe(3);
  });

  test("should update value when triggers change", async () => {
    const computed = new Computed(
      () => stateManager1.value + stateManager2.value,
      [stateManager1, stateManager2]
    );
    stateManager1.value = 3;

    await stateManager1.fulfill();

    expect(computed.value).toBe(5);
  });

  test("should throw error when trying to set value directly", () => {
    const computed = new Computed(
      () => stateManager1.value + stateManager2.value,
      [stateManager1, stateManager2]
    );
    expect(() => {
      computed.value = 10;
    }).toThrow();
  });

  test("should throw error if callback is not a function", () => {
    expect(() => {
      new Computed(123 as any, [stateManager1, stateManager2]);
    }).toThrow();
  });

  test("should throw error if callback returns a promise", () => {
    expect(() => {
      new Computed(() => Promise.resolve(123), [stateManager1, stateManager2]);
    }).toThrow();
  });
});
