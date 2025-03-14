import { TaskManager } from "../src/task-manager";

describe("TaskManager", () => {
  it("should initialize with default values", () => {
    const taskManager = new TaskManager({
      handler: async (value: any) => value,
      stateConfig: { initialValue: null },
      errorConfig: { initialValue: null },
      isProcessingConfig: {
        initialValue: false,
      },
    });

    expect(taskManager.state.value).toBeNull();
    expect(taskManager.error.value).toBeNull();
    expect(taskManager.isProcessing.value).toBe(false);
  });

  it("should set isProcessing to true on request", async () => {
    let isChanged = false;
    const taskManager = new TaskManager({
      handler: async (value: any) => value,

      isProcessingConfig: {
        onChange(newValue) {
          if (newValue) isChanged = true;
        },
      },
    });

    await taskManager.request("TEST");

    expect(isChanged).toBe(true);
  });

  it("should set isProcessing to false on finally", async () => {
    let isChanged = false;
    const taskManager = new TaskManager({
      handler: async (value: any) => value,

      isProcessingConfig: {
        onChange(newValue) {
          isChanged = true;
        },
      },
    });

    await taskManager.request("TEST");

    expect(isChanged).toBe(true);
    expect(taskManager.isProcessing.value).toBe(false);
  });

  it("should reset all states", () => {
    const taskManager = new TaskManager({
      handler: async (value: any) => value,
      stateConfig: { initialValue: null },
      errorConfig: { initialValue: null },
      isProcessingConfig: {
        initialValue: false,
      },
    });

    taskManager.state.value = "TEST";
    taskManager.error.value = { message: "ERROR" } as any;
    taskManager.isProcessing.value = true;

    taskManager.reset();

    expect(taskManager.state.value).toBeNull();
    expect(taskManager.error.value).toBeNull();
    expect(taskManager.isProcessing.value).toBe(false);
  });
});
