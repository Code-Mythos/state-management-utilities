import {
  RequestConfigs,
  RequestCore,
  TaskManagerCoreConfig,
} from "./request-core";

export class TaskManagerCore<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> extends RequestCore<Task, TaskError> {
  public async request(...parameters: Parameters<Task>) {
    this._retriedOnError = 0;

    return await this._requestCore({
      parameters,
      config: {},
    });
  }

  public config(config: RequestConfigs<Task, TaskError>) {
    return {
      request: async (...parameters: Parameters<Task>) => {
        this._retriedOnError = 0;

        return await this._requestCore({
          parameters,
          config: config ?? {},
        });
      },
    };
  }

  public async invalidate(config: RequestConfigs<Task, TaskError> = {}) {
    const requestDetails = this.requestDetails.value;

    if (!requestDetails?.createdAt) return;

    const recentParameters = (requestDetails.parameters ??
      []) as Parameters<Task>;

    return await this.config({
      ...config,
      isInvalidate: true,
    }).request(...recentParameters);
  }

  public async preProcess(...parameters: Parameters<Task>) {
    return await this._requestCore({
      parameters: parameters as any,
      config: {
        isPreProcess: true,
      },
    });
  }
}

export function taskManagerCore<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
>(config: TaskManagerCoreConfig<Task, TaskError>) {
  return new TaskManagerCore<Task, TaskError>(config);
}
