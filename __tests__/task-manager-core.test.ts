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

    it("Should not call the handler if the task is not requested.", async () => {
      const handler = jest.fn(() => Promise.resolve("result"));
      let isInvalidated = false;

      const taskManager = new TaskManagerCore({
        handler,
      });

      await taskManager.invalidate({
        onSuccess() {
          isInvalidated = true;
        },
      });

      expect(isInvalidated).toBe(false);
    });
  });

  describe("The preProcess method: ", () => {
    it("Should call the request handler.", async () => {
      const handler = jest.fn(() => Promise.resolve("result"));

      const taskManager = new TaskManagerCore({
        handler,
      });

      await taskManager.preProcess();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe("The config method: ", () => {
    it("Should throw an error if isInvalidate and isPreProcess are used together.", () => {
      const taskManager = new TaskManagerCore({
        handler: () => Promise.resolve("result"),
      });

      expect(() => {
        taskManager.config({
          isInvalidate: true,
          isPreProcess: true,
        });
      }).toThrow();
    });
  });

  describe("the reset method: ", () => {
    it("Should reset the requestDetails to its initial value.", () => {
      const taskManager = new TaskManagerCore({
        handler: () => Promise.resolve("result"),
      });

      const primary = taskManager.requestDetails.value;

      taskManager.request();

      expect(taskManager.requestDetails.value.createdAt).not.toEqual(
        primary.createdAt
      );

      taskManager.reset();

      expect(taskManager.requestDetails.value.createdAt).toEqual(
        primary.createdAt
      );
    });
  });

  describe("Retry on error: ", () => {
    it("Should retry the task if the retryOnError is set.", async () => {
      const retryOnError = 2;
      let retryCount = 0;

      const taskManager = new TaskManagerCore({
        handler() {
          ++retryCount;
          return Promise.reject(new Error("ERROR"));
        },
        retryOnError,
      });

      await taskManager.request();

      expect(retryCount).toBe(retryOnError);
    });

    it("Should not retry the task if the retryOnError is not set.", async () => {
      const handler = jest.fn(() => Promise.reject(new Error("ERROR")));
      let retryCount = 0;

      const taskManager = new TaskManagerCore({
        handler,
      });

      await taskManager
        .config({
          onError() {
            retryCount++;
          },
        })
        .request();

      expect(retryCount).toBe(1);
    });

    it("Should delay the retry if the retryDelay is set.", async () => {
      const retryOnError = 2;
      const retryDelay = 1000;
      const retryDelayMargin = 100;
      let retryCount = 0;

      const taskManager = new TaskManagerCore({
        handler() {
          ++retryCount;
          return Promise.reject(new Error("ERROR"));
        },
        retryOnError,
        retryOnErrorDelay: retryDelay,
      });

      await taskManager.request();

      expect(retryCount).toBe(1);
    });
  });

  describe("Block the request: ", () => {
    it("Should block the request if the blockRequest is set.", async () => {
      const taskManager = new TaskManagerCore({
        handler: () => Promise.resolve("result"),

        preventNewRequestDuration: 1000 * 5,
      });

      await taskManager.request();
      expect(taskManager.requestDetails.value.isBlocked).toBeFalsy();
      await taskManager.request();
      expect(taskManager.requestDetails.value.isBlocked).toBe(true);
    });
  });
});
