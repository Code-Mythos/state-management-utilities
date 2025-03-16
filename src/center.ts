import type { StateManager } from "./state-manager";

import { produce } from "immer";

/**
 * The `StateManagerCenter` class is a singleton that manages multiple state managers,
 * logs state changes, and provides methods for state hydration and dehydration.
 */
class StateManagerCenter {
  protected _cacheRefs: Record<string, CacheRef> = {};

  /**
   * A record of state managers identified by unique IDs.
   */
  protected _stateManagers: Record<string, StateManager<any>> = {};

  /**
   * An array of state manager center records.
   */
  protected _records: CenterRecordType[] = [];

  /**
   * A record of the current states identified by unique IDs.
   */
  protected _currentStates: Record<string, any> = {};

  /**
   * A flag indicating whether logging is enabled.
   */
  protected _isEnabledLog: boolean = true;

  /**
   * A flag indicating whether cloning is disabled.
   */
  protected _disableCloning: boolean = false;

  /**
   * An optional callback function for logging.
   */
  protected _onLog:
    | ((props: { uid: string; state: any }) => Promise<void>)
    | undefined;

  /**
   * A flag indicating whether hydration is in progress.
   */
  protected _isHydration = false;

  /**
   * Gets the hydration status.
   */
  public get isHydration() {
    return this._isHydration;
  }

  /**
   * The singleton instance of `StateManagerCenter`.
   */
  private static _instance: StateManagerCenter;

  /**
   * Private constructor to prevent direct instantiation.
   */
  private constructor() {}

  /**
   * Gets the cloning disable status.
   */
  public get disableCloning() {
    return this._disableCloning;
  }

  /**
   * Sets the cloning disable status.
   */
  public set disableCloning(value: boolean) {
    this._disableCloning = value;
  }

  /**
   * Gets the singleton instance of `StateManagerCenter`.
   */
  public static get instance() {
    if (!StateManagerCenter._instance) {
      StateManagerCenter._instance = new StateManagerCenter();
    }

    return StateManagerCenter._instance;
  }

  /**
   * Gets the current states.
   */
  public get currentStates() {
    return this._currentStates;
  }

  /**
   * Gets the logging enable status.
   */
  public get enableLog() {
    return this._isEnabledLog;
  }

  /**
   * Sets the logging enable status.
   */
  public set enableLog(value: boolean) {
    if (value === this._isEnabledLog) return;

    this._isEnabledLog = value;

    if (!value) {
      this._records = [];
    }

    this._onLog?.({ uid: "TOGGLED-STATUS", state: { enable: value } }).catch(
      console.error
    );
  }

  /**
   * Returns the state manager center records.
   * These records can be sent to the server for monitoring and debugging purposes.
   *
   * @returns The state manager center records.
   */
  public get records(): CenterRecordType[] {
    return this._records;
  }

  /**
   * Sets the current records to the provided records.
   * This method can be used for monitoring and debugging purposes.
   *
   * @param records - The records to be set.
   */
  public set records(records: CenterRecordType[]) {
    this._records = records;
    this._onLog?.({ uid: "IMPORTED", state: undefined }).catch(console.error);
  }

  /**
   * Gets the state manager center records in reverse order.
   */
  public async getReverseRecords(): Promise<CenterRecordType[]> {
    return this._records?.slice().reverse() ?? [];
  }

  /**
   * Logs a state change.
   */
  public _log({ uid, state }: { uid: string; state: any }) {
    if (!this.enableLog) return this;

    this._currentStates[uid] = state;

    const timestamp = Date.now();
    const number = ++counter;

    (async () => {
      this._records = produce(this._records, (draft) => {
        draft.push({
          updatedUID: uid,
          states: { ...this._currentStates },
          timestamp,
          number,
        });
      });

      this._onLog?.({ uid, state })?.catch(console.error);
    })().catch(console.error);

    return this;
  }

  /**
   * Registers a state manager with a unique ID.
   */
  public _register({
    uid,
    stateManager,
  }: {
    uid: string;
    stateManager: StateManager<any>;
  }) {
    if (this._stateManagers[uid])
      throw new Error(
        `UID "${uid}" already is registered in the "State Manager Center".`
      );

    this._stateManagers[uid] = stateManager;

    return this;
  }

  /**
   * Applies the given states to the related state managers.
   *
   * @param {CenterRecordType} record - An object containing the states to be applied.
   * @returns {this} The current instance of the class.
   */
  public apply({ states }: CenterRecordType) {
    try {
      for (const uid in states) {
        if (this._stateManagers[uid])
          this._stateManagers[uid].value = states[uid];
      }
    } catch (error) {
      /* istanbul ignore next */
      console.error(
        `Error occurred while applying the states in the "State Manager Center".\n`,
        error
      );
    }

    return this;
  }

  /**
   * Initializes the hydration process.
   */
  protected _initializeHydration() {
    this._isHydration = true;
    this.enableLog = true;
    this._records = [];
    this._currentStates = {};

    return this;
  }

  /**
   * Hydrates the state managers with the provided entities.
   * @param entities - The entities to be hydrated.
   * @returns The hydrated states.
   * @throws An error if the entity does not have a `hydrated` property.
   */

  public get hydrated() {
    return {
      generate: async (...entries: HydratedEntries) =>
        await this._generateHydrated({ entries }),

      config: ({ initial }: { initial: Hydrated }) => ({
        generate: async (...entries: HydratedEntries) =>
          await this._generateHydrated({ entries, initial }),
      }),
    };
  }

  protected async _generateHydrated({
    entries,
    initial,
  }: {
    initial?: Hydrated;
    entries: HydratedEntries;
  }): Promise<{ hydrated: Hydrated; values: any[] }> {
    this._initializeHydration();

    const updaters = await Promise.all(entries);

    const timestamp = Date.now();

    const hydrated: Hydrated = initial ?? {
      data: {},
      timestamp,
      id: `${timestamp}`,
    };

    const values: any[] = [];

    updaters.forEach(({ update, value }) => {
      update(hydrated.data);

      values.push(value);
    });

    return Object.freeze({ hydrated, values });
  }

  public _registerCacheRef({ uid, ref }: { uid: string; ref: any }) {
    this._cacheRefs[uid] = ref;

    return this;
  }

  /**
   * Dehydrates the state managers with the provided states.
   * @param states - The states to be dehydrated.
   */
  public async dehydrate(hydrated: Hydrated) {
    if (!hydrated) return;

    for (const uid in hydrated.data) {
      const data = hydrated.data[uid];
      data.timestamp = data.timestamp ? data.timestamp : hydrated.timestamp;

      this._updateCache(data);
    }
  }

  protected async _updateCache({
    value,
    hash,
    cacheRef,
    timestamp,
  }: HydratedItem) {
    if (!hash || !cacheRef || !timestamp) return;

    const ref = this._cacheRefs[cacheRef];

    const { updatedAt } = (await ref?._getCache?.(hash)) ?? {};

    if (updatedAt && updatedAt >= timestamp) return;

    ref?._setCache?.(hash, { data: value, updatedAt: timestamp });
  }

  /**
   * Registers a callback function for logging.
   * If a callback is already registered, an error will be thrown.
   * @param callback - The callback function to be registered.
   * @returns The `StateManagerCenter` instance.
   * @throws An error if a callback is already registered.
   */
  public onLog(
    callback:
      | ((props: { uid: string; state: any }) => Promise<void>)
      | undefined
  ): StateManagerCenter {
    if (this._onLog && callback)
      throw new Error(
        `"onLog" callback is already registered in the "State Manager Center".`
      );

    this._onLog = callback;

    return this;
  }

  /**
   * Clears the state manager center records.
   */
  public clearRecords() {
    this._records = [];

    this._onLog?.({ uid: "CLEARED", state: undefined }).catch(console.error);

    return this;
  }
}

let counter = 0;

export const center = StateManagerCenter.instance;

export type CenterRecordType = {
  updatedUID: string;
  timestamp: number;
  states: Record<string, any>;
  number: number;
};

export type HydratedEntries = (Promise<HydratedEntry> | HydratedEntry)[];

export type HydratedEntry = {
  update: (record: Hydrated["data"]) => void;
  value: any;
};

export type Hydrated = {
  id: string;
  data: Record<string, HydratedItem>;
  timestamp: number;
};

export type HydratedItem = {
  value: any;
  hash?: string;
  cacheRef?: string;
  timestamp?: number;
};

export interface CacheRef {
  _getCache(
    cacheKey: string
  ): Promise<{ data: any; updatedAt: number } | undefined>;

  _setCache(cacheKey: string, value: { data: any; updatedAt: number }): void;
}
