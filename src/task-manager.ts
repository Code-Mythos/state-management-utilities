/* istanbul ignore file */

import { TaskManagerCore } from "task-manager-core";

import { center } from "./center";
import { StateManager } from "./state-manager";

import type { Hydrated, HydratedEntry } from "./center";
import type { TypeStateManagerConfigs } from "./state-manager";

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
  TaskError = any,
  Meta = Record<string, any>
> extends TaskManagerCore<Task, TaskError, Meta> {
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
  }: TaskManagerConfig<Task, TaskError, Meta>) {
    const defaultEventHandlers: TaskManagerCoreConfig<
      Task,
      TaskError,
      Meta
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
    } as TaskManagerCoreConfig<Task, TaskError, Meta>;

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

    center._registerCacheRef({ uid: this.uid, ref: this });
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
    config: RequestConfigBase<Task, TaskError, Meta>;
  }): boolean {
    return center.isHydration ? false : super._isPrevented({ hash, config });
  }

  async hydrate(...parameters: Parameters<Task>): Promise<HydratedEntry> {
    const result = await this._requestCore({
      parameters,
      config: { isInvalidate: true },
    });

    const { hash, createdAt, updatedAt, data, error, isError } = result;

    const cacheRef = this.uid;
    const UIDs = {
      state: this.state.uid,
      error: this.error.uid,
      details: this._requestDetails_.uid,
    };

    const details: RequestDataRecordType<Task> = {
      updatedAt,
      createdAt,
      isFailed: Boolean(isError),
      isSucceed: !isError,
      parameters,
    };

    return {
      update: (record) => {
        if (data !== undefined)
          record[UIDs.state] = {
            value: data,
            hash,
            cacheRef,
          };

        if (error !== undefined)
          record[UIDs.error] = {
            value: error,
          };

        record[UIDs.details] = {
          value: details,
        };
      },

      value: result,
    };
  }
}

let counter = 0;

export type StateManagerConfigs<StateType> = {
  initialValue?: StateType;
} & Omit<TypeStateManagerConfigs<StateType>, "uid">;

export type TaskManagerConfig<
  Task extends (...args: any) => Promise<any>,
  TaskError = any,
  Meta = Record<string, any>
> = {
  uid?: string;

  stateConfig?: StateManagerConfigs<
    Awaited<ReturnType<Task>> | undefined | null
  >;
  errorConfig?: StateManagerConfigs<TaskError | undefined>;
  isProcessingConfig?: StateManagerConfigs<boolean>;
  requestParamsConfig?: StateManagerConfigs<RequestDataRecordType<Task>>;
} & TaskManagerCoreConfig<Task, TaskError, Meta>;

export type {
  RequestConfigBase,
  RequestConfigs,
  RequestDataRecordType,
  RequestEventHandlersType,
  RequestStatus,
  SharedConfigs,
  TaskManagerCoreConfig,
  TaskManagerInterceptorsType,
} from "task-manager-core";
