import { center, CenterRecordType } from "../src/center";
import { StateManager } from "../src/index";

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

  test("should hydrate state managers", async () => {
    const value = "TEST";
    const key = "KEY";
    const entity = Promise.resolve({ hydrated: { [key]: value } });
    const hydratedStates = await center.hydrate(entity);
    expect(hydratedStates[key]).toEqual(value);
  });

  test("should dehydrate state managers", () => {
    const uid = Date.now().toString();
    const newState = "NEW";
    const stateManager = new StateManager("PREV", { uid });
    const states = { [uid]: newState };
    center.dehydrate(states);
    expect(stateManager.value).toBe(newState);
  });

  test("should clear records", async () => {
    const state = { key: "value" };
    center._log({ uid: "test", state });
    center.clearRecords();
    const records = await center.getReverseRecords();
    expect(records.length).toBe(0);
  });

  test("should register onLog callback", async () => {
    const mockCallback = jest.fn().mockResolvedValue(undefined);
    center.onLog(undefined);
    center.onLog(mockCallback);
    const state = { key: "value" };
    center._log({ uid: "test", state });
    expect(mockCallback).toHaveBeenCalled();
  });

  test("should throw error if onLog callback is already registered", () => {
    const mockCallback = jest.fn().mockResolvedValue(undefined);
    center.onLog(undefined);
    center.onLog(mockCallback);
    expect(() => center.onLog(mockCallback)).toThrow();
  });

  test("Should isHydration be true when hydrate is called", async () => {
    await center.hydrate();

    expect(center.isHydration).toBe(true);
  });

  test("Should disableCloning change when it is assigned to new state.", async () => {
    center.disableCloning = true;

    expect(center.disableCloning).toBe(true);

    center.disableCloning = false;

    expect(center.disableCloning).toBe(false);
  });

  test("The clearRecords method should empty the records", () => {
    center.records = [
      {
        updatedUID: "test",
        states: { key: "value" },
        timestamp: Date.now(),
        number: 1,
      },
    ];
    expect(center.records.length).toBe(1);

    center.clearRecords();
    expect(center.records.length).toBe(0);
  });
});
