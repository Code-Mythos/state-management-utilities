import type { Hydrated, HydratedEntry } from "./center";

import { produce } from "immer";
import cloneDeep from "lodash.clonedeep";

import { center } from "./center";

/**
 * This class provides methods to register, un-register, update, and retrieve state, ensuring components are updated efficiently and consistently.
 */
export class StateManager<StateType> {
  protected _value: StateType;

  /**
   * The current state change promise.
   *
   * @protected
   * @type {Promise<any>}
   */
  protected _fulfill: Promise<any> | undefined;

  /**
   * Returns the promise to full fill the current state change.
   *
   * @returns the instance of the state manager for method chaining.
   */
  public async fulfill() {
    if (this._fulfill) await this._fulfill;

    return this;
  }

  /**
   * A dictionary of callbacks registered in the state manager.
   * The key is the unique identifier of the callback, and the value is the callback function.
   * The callback function receives the new state whenever it is updated.
   */
  protected _callbacks: Record<
    string,
    (newState: StateType) => void | Promise<void>
  > = {};

  constructor(
    /**
     * Initial state of the manager.
     */
    protected _initialValue: StateType,

    /**
     * Options to configure the state manager.
     */
    private _configs: TypeStateManagerConfigs<StateType> = {
      uid: `SM-#${counter++}`,
    }
  ) {
    this._value = this._clone(this._initialValue);
    // TODO: Should it log the initial state?
    // eslint-disable-next-line no-self-assign
    // this._value = this._value;
    this._configs.onChange?.(this._value);

    center._register({
      uid: this._configs.uid,
      stateManager: this,
    });
  }

  public get value(): Readonly<StateType> {
    return this._clone(this._value);
  }

  public set value(newState: StateType) {
    this._setValueHandler(newState);
  }

  hydrate(value: StateType): HydratedEntry {
    return {
      update: (record: Hydrated["data"]) => {
        if (value !== undefined)
          record[this.uid] = {
            value,
          };
      },

      value,
    };
  }

  /**
   * Handles setting a new state value.
   *
   * This method clones the new state (if cloning is not disabled) and assigns it to the internal `_value` property.
   * It then logs the new state using the `center._log` method.
   *
   * After logging, it asynchronously triggers the `onChange` callback if it exists,
   * and iterates over the `_callbacks` object to call each callback with the new state.
   *
   * @param newState - The new state to be set.
   */
  protected _setValueHandler(newState: StateType) {
    this._value = this._clone(newState);

    center._log({
      uid: this._configs.uid,
      state: newState,
    });

    this._fulfill = (async () => {
      await this._configs.onChange?.(newState);

      for (const setterId in this._callbacks) {
        /* istanbul ignore next */
        await this._callbacks?.[setterId]?.(newState);
      }
    })().catch(console.error);
  }

  /**
   * Gets the unique identifier (uid) from the configuration.
   *
   * @returns {string} The unique identifier.
   */
  public get uid() {
    return this._configs.uid;
  }

  /**
   * Registers a new callback in the state manager.
   */
  public register({
    uid,
    callback,
  }: {
    /**
     * Unique identifier for the callback.
     */
    uid: string;
    /**
     * Callback to be registered.
     */
    callback: (newState: StateType) => void | Promise<void>;
  }) {
    if (this._callbacks[uid]) {
      throw new Error(
        `Callback with uid of ${uid} is already registered in ${this.uid}.`
      );
    }

    this._callbacks[uid] = callback;

    return this;
  }

  /**
   * Unregister a callback from the state manger.
   */
  public unregister({
    uid,
  }: {
    /**
     * Unique identifier of the callback.
     */
    uid: string;
  }) {
    delete this._callbacks[uid];

    return this;
  }

  /**
   * Returns the unique IDs of the registered callbacks.
   */
  public get registeredCallbacks() {
    return Object.keys(this._callbacks);
  }

  /**
   * Triggers the state manager to update the components.
   */
  public trigger() {
    // eslint-disable-next-line no-self-assign
    this.value = this.value;
  }

  /**
   * Resets the state manager to its initial state.
   */
  public reset() {
    this.value = this._initialValue;
  }

  /**
   * Clones the given state value if cloning is not disabled.
   *
   * @param value - The state value to be cloned.
   * @returns The cloned state value if cloning is enabled; otherwise, returns the original value.
   */
  protected _clone(value: StateType) {
    return this._configs.disableCloning || center.disableCloning
      ? value
      : cloneDeep(value);
  }

  public get initialValue() {
    return this._clone(this._initialValue);
  }

  /**
   * Updates the current state using the provided updater function (it utilizes immer js).
   *
   * @param updater - A function that takes the previous state and returns the new state.
   * @returns The current instance for method chaining.
   */
  public update(updater: (prev: StateType) => StateType) {
    this.value = produce(this._value, updater);

    return this;
  }
}

let counter = 0;

// Types **********************************************************************
export type TypeStateManagerConfigs<StateType> = {
  /**
   * Unique identifier for the state manager.
   */
  uid: string;

  /**
   * A callback that receives the new state whenever it is updated.
   * You can utilize "onChange" callback to modify other state manager instances or variables.
   * With "onChange" callback you do not need to cope with creating a unique id to register a callback with "register" method.
   *
   * Important Notes:
   * It will not be unregistered ever.
   * It will be triggered even in the initialization of the state manager.
   *
   * @param newState
   * @returns void
   */
  onChange?: (newState: StateType) => void;

  /**
   * Disables cloning for the state manager.
   */
  disableCloning?: boolean;
};
