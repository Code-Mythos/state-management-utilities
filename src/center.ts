import type { StateManager } from "./state-manager";

import { produce } from "immer";

/**
 * The `StateManagerCenter` class is a singleton that manages multiple state managers,
 * logs state changes, and provides methods for state hydration and dehydration.
 */
class StateManagerCenter {
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
  public async hydrate(...entities: Promise<any>[]) {
    this._initializeHydration();

    const pointers = await Promise.all(entities);

    return pointers.reduce((acc, pointer) => {
      if (typeof pointer !== "object") return acc;

      const hydrated = pointer.hydrated;

      if (typeof hydrated !== "object") return acc;

      return { ...acc, ...hydrated };
    }, {} as Record<string, any>);
  }

  /**
   * Dehydrates the state managers with the provided states.
   * @param states - The states to be dehydrated.
   */
  public dehydrate(states: Record<string, any>) {
    return this.apply({
      updatedUID: "APPLIED",
      timestamp: -1,
      number: -1,
      states,
    });
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
