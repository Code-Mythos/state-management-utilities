import { TaskManagerCore } from "../src/task-manager-core/index";

describe("TaskManagerCore", () => {
  describe("The handler:", () => {
    it("Should be called with the request method is called", async () => {
      const handler = jest.fn(() => Promise.resolve("result"));

      const taskManager = new TaskManagerCore({
        handler,
      });

      await taskManager.request();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe("The onCache event handler: ", () => {
    it("Should be ignored because it is based on indexDB which is not available in the test environment.", async () => {
      let isCalled = false;
      let cache: any = null;

      const taskManager = new TaskManagerCore({
        handler: () => Promise.resolve("result"),

        cache: {
          enableCache: true,
          cacheId: "test",
        },
      });

      await taskManager
        .config({
          onCache: (props) => {
            isCalled = true;
            cache = props.cache;
          },
        })
        .request();

      expect(isCalled).toBe(true);
      expect(cache).toBe(undefined);
    });
  });

  describe("The onSuccess event handler: ", () => {
    it("Should be called with the result of the task.", async () => {
      const value = "SUCCESS";
      let receivedValue: any = null;

      const taskManager = new TaskManagerCore({
        handler: () => Promise.resolve(value),
      });

      await taskManager
        .config({
          onSuccess({ data }) {
            receivedValue = data;
          },
        })
        .request();

      expect(receivedValue).toBe(value);
    });
  });

  describe("The onError event handler: ", () => {
    it("Should be called with the error of the task.", async () => {
      const error = new Error("ERROR");
      let receivedError: any = null;

      const taskManager = new TaskManagerCore({
        handler: () => Promise.reject(error),
      });

      await taskManager
        .config({
          onError({ error }) {
            receivedError = error;
          },
        })
        .request();

      expect(receivedError).toBe(error);
    });
  });

  describe("The onFinally event handler: ", () => {
    it("Should be called after the task is completed.", async () => {
      const onFinally = jest.fn();

      const taskManager = new TaskManagerCore({
        handler: () => Promise.resolve("result"),
      });

      await taskManager
        .config({
          onFinally,
        })
        .request();

      expect(onFinally).toHaveBeenCalled();
    });
  });

  describe("The invalidate method: ", () => {
    it("Should call the request handler.", async () => {
      const handler = jest.fn(() => Promise.resolve("result"));
      let isInvalidated = false;

      const taskManager = new TaskManagerCore({
        handler,
      });

      await taskManager.request();

      await taskManager.invalidate({
        onSuccess() {
          isInvalidated = true;
        },
      });

      expect(isInvalidated).toBe(true);
    });
  });

  describe("The preProcess method: ", () => {
    it("Should call the request handler.", async () => {
      const handler = jest.fn(() => Promise.resolve("result"));

      const taskManager = new TaskManagerCore({
        handler,
      });

      await taskManager.preProcess();

      console.log(taskManager.requestDetails.value);

      expect(handler).toHaveBeenCalled();
    });
  });
});
