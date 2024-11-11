import {
  RequestConfigs,
  RequestCore,
  RequestEventHandlersType,
  TaskManagerCoreConfig,
} from "./request-core";

/**
 * TaskManagerCore manages the tasks and triggers events based on the task's lifecycle.
 * The onCache, onRequest, onSuccess, onError, and onFinally events are triggered based on the task's lifecycle.
 *
 * @template Task - A function type that returns a Promise.
 * @template TaskError - The type of error that can be thrown by the task.
 */
export class TaskManagerCore<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> extends RequestCore<Task, TaskError> {
  /**
   * Initiates a request with the given parameters.
   *
   * @param {...Parameters<Task>} parameters - The parameters to pass to the task.
   * @returns {Promise<any>} - The result of the task.
   */
  public async request(...parameters: Parameters<Task>) {
    this._retriedOnError = 0;

    return await this._requestCore({
      parameters,
      config: {},
    });
  }

  /**
   * Configures the request with the given configuration.
   *
   * @param {RequestConfigs<Task, TaskError>} config - The configuration for the request.
   * @returns {Object} - An object containing a request function.
   */
  public config(config: RequestConfigs<Task, TaskError>): {
    request: (...parameters: Parameters<Task>) => Promise<any>;
  } {
    if (config.isInvalidate && config.isPreProcess)
      throw new Error("isInvalidate and isPreProcess cannot be used together!");

    return {
      /**
       * Initiates a request with the given parameters and the configured settings.
       *
       * @param {...Parameters<Task>} parameters - The parameters to pass to the task.
       * @returns {Promise<any>} - The result of the task.
       */
      request: async (...parameters: Parameters<Task>) => {
        this._retriedOnError = 0;

        return await this._requestCore({
          parameters,
          config: config ?? {},
        });
      },
    };
  }

  /**
   * Invalidates the current request.
   * it will ignore any blocker logics and re-fetch the data.
   *
   * @param {Omit<RequestEventHandlersType<Task, TaskError>, "onCache">} [config={}] - The configuration for the request.
   * @returns {Promise<any>} - The result of the invalidated task.
   */
  public async invalidate(
    config: Omit<RequestEventHandlersType<Task, TaskError>, "onCache"> = {}
  ) {
    const requestDetails = this.requestDetails.value;

    if (!requestDetails?.createdAt) return;

    const recentParameters = (requestDetails.parameters ??
      []) as Parameters<Task>;

    return await this.config({
      ...config,
      isInvalidate: true,
    }).request(...recentParameters);
  }

  /**
   * Pre-processes the request with the given parameters.
   * It only affects the cache and does not change the current request parameters.
   *
   * @param {...Parameters<Task>} parameters - The parameters to pass to the task.
   * @returns {Promise<any>} - The result of the pre-processed task.
   */
  public async preProcess(...parameters: Parameters<Task>) {
    return await this._requestCore({
      parameters,
      config: {
        isPreProcess: true,
      },
    });
  }
}
