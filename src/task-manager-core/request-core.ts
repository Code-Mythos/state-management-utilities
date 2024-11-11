import { CacheCore, CacheCoreConfig, TypeCacheRecord } from "./cache-core";

export class RequestCore<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> extends CacheCore<
  Awaited<ReturnType<Task>> | undefined | null,
  Parameters<Task>
> {
  constructor(protected _config: TaskManagerCoreConfig<Task, TaskError>) {
    super(_config.cache ?? {});
  }

  protected _retriedOnError = 0;

  protected _defaultRequestDetails: RequestDataRecordType<Task> = {};

  protected _requestDetails: RequestDataRecordType<Task> =
    this._defaultRequestDetails;

  public get requestDetails(): Readonly<{
    value: RequestDataRecordType<Task>;
  }> {
    return { value: this._requestDetails };
  }

  protected _setRequestDetails(
    updater: (prev: RequestDataRecordType<Task>) => RequestDataRecordType<Task>
  ) {
    this._requestDetails = updater(this.requestDetails.value);
  }

  protected _isPrevented({
    hash,
    config: { isInvalidate = false },
  }: {
    hash: string;
    config: RequestConfigBase<Task, TaskError>;
  }) {
    const requestDetails = this.requestDetails.value ?? {};
    const preventDuration = this._config.preventNewRequestDuration ?? 0;

    const isBlocked = Boolean(
      !isInvalidate &&
        requestDetails.createdAt &&
        !requestDetails.isFailed &&
        !requestDetails.isBlocked &&
        preventDuration > 0 &&
        this._isSameRequest(hash) &&
        Date.now() - requestDetails.createdAt <= preventDuration
    );

    if (isBlocked) {
      this._setRequestDetails((prev) => ({
        ...prev,
        isBlocked: true,
        status: "blocked",
        procedure: (prev.procedure ?? []).concat("blocked"),
      }));
    }

    return isBlocked;
  }

  protected async _requestCore({
    parameters,
    config,
  }: {
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
  }): Promise<this> {
    const createdAt = Date.now();

    const hash = this._getHash(parameters as any);

    if (this._isPrevented({ hash, config })) return this;

    if (!config.isPreProcess) {
      this._setRequestDetails(() => ({
        parameters,
        hash,
        createdAt,
        updatedAt: createdAt,
        isRequested: true,
        status: "requested",
        procedure: ["requested"],
      }));
    }

    let data: Awaited<ReturnType<Task>> | undefined | null = null;
    let error: any;
    let isPrevented = false;

    try {
      const result = await this._try({
        parameters,
        config,
        hash,
      });

      data = result.data;
      if (result.isPrevented) isPrevented = true;
    } catch (currentError: any) {
      error = await this._error({
        parameters,
        config,
        hash,
        error: currentError,
      });
    } finally {
      if (isPrevented) return this;

      await this._finally({
        parameters,
        config,
        hash,
        error,
        data,
      });
    }

    return this;
  }

  private async _try({
    parameters: parametersRaw,
    config,
    hash,
  }: {
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
    hash: string;
  }): Promise<{
    data: Awaited<ReturnType<Task>> | undefined | null;
    isPrevented?: boolean;
  }> {
    let data: Awaited<ReturnType<Task>> | undefined | null = null;

    const { onRequest, onSuccess, onCache, isInvalidate, isPreProcess } =
      config;

    if (!isInvalidate && !isPreProcess)
      this._getCache(hash).then(async (cacheRaw) => {
        const { cache, isIgnored = false } =
          (await this._config.interceptors?.cache?.({
            cache: cacheRaw,
            hash,
            parameters: [...parametersRaw] as Parameters<Task>,
            config,
          })) ?? { cache: cacheRaw };

        if (
          isIgnored ||
          !this._isSameRequest(hash) ||
          !!this.requestDetails.value?.isSucceed
        )
          return;

        await onCache?.({
          cache,
          isInvalidate,
          isPreProcess,
          hash,
          parameters: parametersRaw,
        });
        await this._config.defaultEventHandlers?.onCache?.({
          cache,
          isInvalidate,
          isPreProcess,
          hash,
          parameters: [...parametersRaw] as Parameters<Task>,
        });

        this._setRequestDetails((prev) => ({
          ...prev,
          isCached: true,
          status: "cached",
          updatedAt: Date.now(),
          procedure: (prev.procedure ?? []).concat("cached"),
        }));
      });

    const { parameters, isPrevented = false } =
      (await this._config.interceptors?.request?.({
        parameters: [...parametersRaw] as Parameters<Task>,
        config,
        hash,
      })) ?? { parameters: parametersRaw };

    if (isPrevented) {
      this._setRequestDetails((prev) => ({
        ...prev,
        isBlocked: true,
        status: "blocked",
        updatedAt: Date.now(),
        procedure: (prev.procedure ?? []).concat("blocked"),
      }));

      return { data, isPrevented: true };
    }

    if (!this._isSameRequest(hash)) return { data };

    await onRequest?.({
      parameters: [...parametersRaw] as Parameters<Task>,
      hash,
      isInvalidate,
      isPreProcess,
    });
    await this._config.defaultEventHandlers?.onRequest?.({
      parameters: [...parametersRaw] as Parameters<Task>,
      hash,
      isInvalidate,
      isPreProcess,
    });

    // const isCachePreventedRequest = this._isCachePreventNewRequest(cache);

    // data =
    //   isCachePreventedRequest && !isInvalidate
    //     ? cache?.data
    //     : await this._config.handler(parameters as any);

    // if (!isCachePreventedRequest || isInvalidate)
    //   this._setCache(paramsHash, { data, updatedAt: Date.now() });

    this._setRequestDetails((prev) => ({
      ...prev,
      isRequested: true,
      status: "began",
      updatedAt: Date.now(),
      procedure: (prev.procedure ?? []).concat("began"),
    }));

    data = await this._config.handler(...(parameters ?? []));

    this._setCache(hash, { data: data ?? undefined, updatedAt: Date.now() });

    if (!this._isSameRequest(hash)) return { data };

    this._retriedOnError = 0;

    this._setRequestDetails((prev) => ({
      ...prev,
      isSucceed: true,
      status: "succeed",
      updatedAt: Date.now(),
      procedure: (prev.procedure ?? []).concat("succeed"),
    }));

    const { data: interceptedData, isIgnored = false } =
      (await this._config.interceptors?.success?.({
        parameters: parametersRaw,
        config,
        data,
        hash,
      })) ?? { data };

    if (isIgnored) return { data, isPrevented: true };

    data = interceptedData;

    await onSuccess?.({
      data,
      hash,
      isInvalidate,
      isPreProcess,
      parameters: [...parametersRaw] as Parameters<Task>,
    });
    await this._config.defaultEventHandlers?.onSuccess?.({
      data,
      hash,
      isInvalidate,
      isPreProcess,
      parameters: [...parametersRaw] as Parameters<Task>,
    });

    return { data };
  }

  private async _error({
    parameters: parametersRaw,
    config,
    hash,
    error: errorRaw,
  }: {
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
    hash: string;
    error: TaskError;
  }): Promise<TaskError> {
    this._setRequestDetails((prev) => ({
      ...prev,
      isFailed: true,
      status: "failed",
      updatedAt: Date.now(),
      procedure: (prev.procedure ?? []).concat("failed"),
    }));

    const parameters = [...parametersRaw] as Parameters<Task>;

    const { error, isIgnored = false } =
      (await this._config.interceptors?.error?.({
        parameters,
        config,
        error: errorRaw,
        hash,
      })) ?? { error: errorRaw };

    if (isIgnored || !this._isSameRequest(hash)) return error;

    if (this._isRetryOnError) {
      ++this._retriedOnError;

      this._config.retryOnErrorDelay && this._config.retryOnErrorDelay > 0
        ? setTimeout(() => {
            this._requestCore({
              parameters,
              config,
            });
          }, this._config.retryOnErrorDelay)
        : this._requestCore({
            parameters,
            config,
          });

      return error;
    }

    await config.onError?.({
      error,
      hash,
      parameters: [...parametersRaw] as Parameters<Task>,
      isInvalidate: config.isInvalidate,
      isPreProcess: config.isPreProcess,
    });
    await this._config.defaultEventHandlers?.onError?.({
      error,
      hash,
      parameters: [...parametersRaw] as Parameters<Task>,
      isInvalidate: config.isInvalidate,
      isPreProcess: config.isPreProcess,
    });

    return error;
  }

  private async _finally({
    parameters: parametersRaw,
    config,
    hash,
    error: errorRaw,
    data: dataRaw,
  }: {
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
    hash: string;
    error: TaskError | undefined;
    data: Awaited<ReturnType<Task>> | undefined | null;
  }) {
    const {
      data,
      error,
      isIgnored = false,
    } = (await this._config.interceptors?.finally?.({
      parameters: [...parametersRaw] as Parameters<Task>,
      config,
      data: dataRaw,
      error: errorRaw,
      hash,
    })) ?? { data: dataRaw, error: errorRaw };

    if (isIgnored || !this._isSameRequest(hash)) return;

    await config.onFinally?.({
      data,
      error,
      hash,
      parameters: [...parametersRaw] as Parameters<Task>,
      isInvalidate: config.isInvalidate,
      isPreProcess: config.isPreProcess,
    });
    await this._config.defaultEventHandlers?.onFinally?.({
      data,
      error,
      hash,
      parameters: [...parametersRaw] as Parameters<Task>,
      isInvalidate: config.isInvalidate,
      isPreProcess: config.isPreProcess,
    });
  }

  protected get _isRetryOnError(): boolean {
    const retryOnError = this._config.retryOnError ?? 0;

    return retryOnError > 0 && this._retriedOnError < retryOnError;
  }

  protected _isSameRequest(hash: string) {
    return hash === this.requestDetails.value?.hash;
  }

  public reset() {
    this._setRequestDetails(() => this._defaultRequestDetails);
    this._retriedOnError = 0;

    return this;
  }
}

export type RequestConfigBase<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> = RequestEventHandlersType<Task, TaskError> & Partial<SharedConfigs>;

export type RequestConfigs<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> =
  | ({ isInvalidate?: never } & RequestEventHandlersType<Task, TaskError>)
  | ({ isInvalidate?: true } & Omit<
      RequestEventHandlersType<Task, TaskError>,
      "onCache"
    >);

export type RequestEventHandlersType<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> = {
  onCache?: (
    params: {
      cache?: TypeCacheRecord<Awaited<ReturnType<Task>> | undefined | null>;
      hash: string;
      parameters: Parameters<Task>;
    } & SharedConfigs
  ) => any;

  onRequest?: (
    params: {
      parameters: Parameters<Task>;
      hash: string;
    } & SharedConfigs
  ) => any;

  onSuccess?: (
    params: {
      data: Awaited<ReturnType<Task>> | undefined | null;
      hash: string;
      parameters: Parameters<Task>;
    } & SharedConfigs
  ) => any | Promise<any>;

  onError?: (
    params: {
      error: TaskError;
      hash: string;
      parameters: Parameters<Task>;
    } & SharedConfigs
  ) => any | Promise<any>;

  onFinally?: (
    props: {
      data?: Awaited<ReturnType<Task>> | undefined | null;
      error?: TaskError;
      hash: string;
      parameters: Parameters<Task>;
    } & SharedConfigs
  ) => any | Promise<any>;
};

export type TaskManagerInterceptorsType<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> = {
  cache?: (props: {
    cache:
      | TypeCacheRecord<Awaited<ReturnType<Task>> | undefined | null>
      | undefined;
    hash: string;
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
  }) => Promise<{
    isIgnored?: boolean;
    cache:
      | TypeCacheRecord<Awaited<ReturnType<Task>> | undefined | null>
      | undefined;
  }>;

  request?: (props: {
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
    hash: string;
  }) => Promise<{
    isPrevented?: boolean;
    parameters: Parameters<Task>;
  }>;

  success?: (props: {
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
    data: Awaited<ReturnType<Task>> | undefined | null;
    hash: string;
  }) => Promise<{
    isIgnored?: boolean;
    data: Awaited<ReturnType<Task>> | undefined | null;
  }>;

  error?: (props: {
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
    error: TaskError;
    hash: string;
  }) => Promise<{
    isIgnored?: boolean;
    error: TaskError;
  }>;

  finally?: (props: {
    parameters: Parameters<Task>;
    config: RequestConfigBase<Task, TaskError>;
    data: Awaited<ReturnType<Task>> | undefined | null;
    error: TaskError | undefined;
    hash: string;
  }) => Promise<{
    isIgnored?: boolean;
    data?: Awaited<ReturnType<Task>> | undefined | null;
    error?: TaskError;
  }>;
};

export type SharedConfigs = {
  isPreProcess: boolean | undefined;
  isInvalidate: boolean | undefined;
};

export type TaskManagerCoreConfig<
  Task extends (...args: any) => Promise<any>,
  TaskError = any
> = {
  handler: Task;

  initialValue?: Awaited<ReturnType<Task>>;

  retryOnError?: number;
  retryOnErrorDelay?: number;
  preventNewRequestDuration?: number;

  cache?: CacheCoreConfig;

  defaultEventHandlers?: RequestEventHandlersType<Task, TaskError>;

  interceptors?: TaskManagerInterceptorsType<Task, TaskError>;
};

export type RequestDataRecordType<Task extends (...args: any) => Promise<any>> =
  {
    parameters?: Parameters<Task>;
    hash?: string;
    createdAt?: number;
    updatedAt?: number;
    isRequested?: boolean;
    isSucceed?: boolean;
    isCached?: boolean;
    isBlocked?: boolean;
    isFailed?: boolean;
    status?: RequestStatus;
    procedure?: RequestStatus[];
  };

export type RequestStatus =
  | "requested"
  | "began"
  | "succeed"
  | "cached"
  | "blocked"
  | "failed";
