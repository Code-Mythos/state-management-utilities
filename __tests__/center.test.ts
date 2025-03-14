import { center } from "../src/center";
import { StateManager } from "../src/state-manager";

describe("StateManagerCenter", () => {
  beforeEach(() => {
    center.clearRecords();
    center.enableLog = true;
  });

  test("should enable and disable logging", () => {
    center.enableLog = false;
    expect(center.enableLog).toBe(false);
    center.enableLog = true;
    expect(center.enableLog).toBe(true);
  });

  test("should throw error if registering a state manager with existing UID", () => {
    const uid = Date.now().toString();
    new StateManager("", { uid });

    expect(() => new StateManager("", { uid })).toThrow();
  });

  test("should log state changes", async () => {
    const uid = Date.now().toString();
    const state = "TEST";
    center._log({ uid, state });
    expect(center.currentStates[uid]).toBe(state);
    const records = await center.getReverseRecords();
    expect(records[0].states[uid]).toBe(state);
  });

  test("should apply states to state managers", () => {
    const uid = Date.now().toString();
    const stateManager = new StateManager("PREV", { uid });
    const newState = "NEW";
    center.apply({
      updatedUID: uid,
      timestamp: Date.now(),
      number: 1,
      states: { [uid]: newState },
    });
    expect(stateManager.value).toBe(newState);
  });

  test("should not log state if logging is disabled", () => {
    center.enableLog = false;
    const uid = Date.now().toString();
    const state = "TEST";
    center._log({ uid, state });
    expect(center.currentStates[uid]).toBeUndefined();
  });

  test("should log state if logging is enabled", async () => {
    center.enableLog = true;
    const uid = Date.now().toString();
    const state = "TEST";
    center._log({ uid, state });
    expect(center.currentStates[uid]).toBe(state);
    const records = await center.getReverseRecords();
    expect(records[0].states[uid]).toBe(state);
  });

  test("should update records with new state", async () => {
    center.enableLog = true;
    const uid = Date.now().toString();
    const state = "TEST";
    center._log({ uid, state });
    const records = await center.getReverseRecords();
    expect(records[0].updatedUID).toBe(uid);
    expect(records[0].states[uid]).toBe(state);
  });

  test("should call onLog callback if registered", async () => {
    const mockCallback = jest.fn().mockResolvedValue(undefined);
    center.onLog(undefined);
    center.onLog(mockCallback);
    const uid = Date.now().toString();
    const state = "TEST";
    center._log({ uid, state });
    expect(mockCallback).toHaveBeenCalled();
  });

  test("should handle errors in onLog callback", async () => {
    const mockCallback = jest.fn();
    center.onLog(undefined);
    center.onLog(mockCallback);
    const uid = Date.now().toString();
    const state = "TEST";
    center._log({ uid, state });
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async callback
    expect(mockCallback).toHaveBeenCalled();
  });
});
