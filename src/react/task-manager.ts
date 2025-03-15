import { TaskManager } from "../task-manager";
import { ReactStateManager } from "./state-manager";

import type {
  TaskManagerConfig,
  StateManagerConfigs,
  RequestDataRecordType,
} from "../task-manager";

export class ReactTaskManager<
  Task extends (...args: any) => Promise<any>,
  TaskError = any,
  Meta = Record<string, any>
> extends TaskManager<
  Task,
  ReactStateManager<Awaited<ReturnType<Task>> | null>,
  ReactStateManager<TaskError | null>,
  ReactStateManager<boolean>,
  ReactStateManager<RequestDataRecordType<Task>>,
  TaskError,
  Meta
> {
  protected override _initializeManager<Manager>({
    name,
    initialValue,
    configs,
  }: {
    name: string;
    initialValue: any;
    configs: StateManagerConfigs<any>;
  }): Manager {
    const uid = `${this._uid}/${name}`;

    return new ReactStateManager(initialValue, {
      uid,
      ...configs,
    }) as any;
  }
}

export function taskManager<
  Task extends (...args: any) => Promise<any>,
  TaskError = any,
  Meta = Record<string, any>
>(
  config: TaskManagerConfig<Task, TaskError, Meta>
): ReactTaskManager<Task, TaskError, Meta> {
  return new ReactTaskManager<Task, TaskError, Meta>(config);
}
