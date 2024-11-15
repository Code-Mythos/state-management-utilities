/* istanbul ignore file */

import { TaskManagerCore } from "task-manager-core";

import { center } from "./center";
import { StateManager } from "./state";

import type { TypeStateManagerConfigs } from "./state";

import type {
  RequestConfigBase,
  RequestDataRecordType,
  TaskManagerCoreConfig,
} from "task-manager-core";

export class TaskManager<
  Task extends (...args: any) => Promise<any>,
  DataManager extends StateManager<Awaited<ReturnType<Task>> | null>,
  ErrorManager extends StateManager<TaskError | null>,
  IsProcessingManager extends StateManager<boolean>,
  RequestParamsManager extends StateManager<RequestDataRecordType<Task>>,
  TaskError = any
> extends TaskManagerCore<Task, TaskError> {
  protected _initializeManager<Manager>({
    name,
    initialValue,
    configs,
  }: {
    name: string;
    initialValue: any;
    configs: StateManagerConfigs<any>;
  }): Manager {
    const uid = `${this._uid}/${name}`;

    return new StateManager(initialValue, {
      uid,
      ...configs,
    }) as any;
  }

  protected _uid: string = `TM-#${counter++}`;

  public readonly state: DataManager;

  public readonly error: ErrorManager;

  public readonly isProcessing: IsProcessingManager;

  protected _requestDetails_: RequestParamsManager;

  public get uid() {
    return this._uid;
  }

  protected _hydrate = () => ({
    [this._requestDetails_.uid]: this._requestDetails_.value ?? null,
    [this.isProcessing.uid]: this.isProcessing.value ?? null,
    [this.state.uid]: this.state.value ?? null,
    [this.error.uid]: this.error.value ?? null,
  });

  public get hydrated() {
    return this._hydrate();
  }

  public override get requestDetails(): Readonly<{
    value: RequestDataRecordType<Task>;
  }> {
    return {
      value: this._requestDetails_.value,
    };
  }

  protected override _setRequestDetails(
    updater: (prev: RequestDataRecordType<Task>) => RequestDataRecordType<Task>
  ) {
    this._requestDetails_.set(updater);
  }

  constructor({
    uid,
    stateConfig,
    errorConfig,
    isProcessingConfig,
    requestParamsConfig,

    ...configs
  }: TaskManagerConfig<Task, TaskError>) {
    const defaultEventHandlers: TaskManagerCoreConfig<
      Task,
      TaskError
    >["defaultEventHandlers"] = {
      ...configs.defaultEventHandlers,

      onCache: async (props) => {
        this.state.value = props.cache?.data ?? null;

        if (center.isHydration) return;

        configs.defaultEventHandlers?.onCache?.(props);
      },

      onRequest: async (props) => {
        this.isProcessing.value = true;

        if (center.isHydration) return;

        configs.defaultEventHandlers?.onRequest?.(props);
      },

      onSuccess: async (props) => {
        this.state.value = props.data ?? null;

        if (center.isHydration) return;

        configs.defaultEventHandlers?.onSuccess?.(props);
      },

      onError: async (props) => {
        this.error.value = props.error;

        if (center.isHydration) return;

        configs.defaultEventHandlers?.onError?.(props);
      },

      onFinally: async (props) => {
        this.isProcessing.value = false;

        if (center.isHydration) return;

        configs.defaultEventHandlers?.onFinally?.(props);
      },
    };

    const newConfigs = {
      ...configs,
      defaultEventHandlers,
    } as TaskManagerCoreConfig<Task, TaskError>;

    super(newConfigs);

    if (uid) this._uid = uid;

    this.state = this._initializeManager<DataManager>({
      name: "state",
      initialValue: stateConfig?.initialValue ?? null,
      configs: stateConfig ?? {},
    });

    this.error = this._initializeManager<ErrorManager>({
      name: "error",
      initialValue: errorConfig?.initialValue ?? null,
      configs: errorConfig ?? {},
    });

    this.isProcessing = this._initializeManager<IsProcessingManager>({
      name: "is-processing",
      initialValue: isProcessingConfig?.initialValue ?? false,
      configs: isProcessingConfig ?? {},
    });

    this._requestDetails_ = this._initializeManager<RequestParamsManager>({
      name: "request-details",
      initialValue:
        requestParamsConfig?.initialValue ?? this._defaultRequestDetails,
      configs: requestParamsConfig ?? {},
    });
  }

  public override reset() {
    this.state.reset();
    this.error.reset();
    this.isProcessing.reset();
    this._requestDetails_.reset();
    this._retriedOnError = 0;

    return this;
  }

  protected override _isPrevented({
    hash,
    config,
  }: {
    hash: string;
    config: RequestConfigBase<Task, TaskError>;
  }): boolean {
    return center.isHydration ? false : super._isPrevented({ hash, config });
  }
}

let counter = 0;

export type StateManagerConfigs<StateType> = {
  initialValue?: StateType;
} & Omit<TypeStateManagerConfigs<StateType>, "uid">;

export type TaskManagerConfig<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> = {
  uid?: string;

  stateConfig?: StateManagerConfigs<
    Awaited<ReturnType<Task>> | undefined | null
  >;
  errorConfig?: StateManagerConfigs<TaskError | undefined>;
  isProcessingConfig?: StateManagerConfigs<boolean>;
  requestParamsConfig?: StateManagerConfigs<RequestDataRecordType<Task>>;
} & TaskManagerCoreConfig<Task, TaskError>;
