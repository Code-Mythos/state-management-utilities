import type { TypeStateManagerConfigs } from "./state";

import { StateManager } from "./state";

export class Computed<DataType> extends StateManager<DataType> {
  public override get value() {
    return this._clone(this._value);
  }

  public override set value(_: any) {
    throw new Error("Computed state manager value cannot be set directly.", {
      cause: {
        uid: this.uid,
      },
    });
  }

  constructor(
    callback: () => DataType,
    triggers: (StateManager<any> | Computed<any>)[],
    config: TypeStateManagerConfigs<DataType> = {
      uid: `CSM-${++counter}`,
    }
  ) {
    if (typeof callback !== "function") {
      throw new Error("Computed state manager callback must be a function.");
    }

    const initialValue = callback();

    if (initialValue instanceof Promise) {
      throw new Error(
        "Computed state manager callback must not return a promise."
      );
    }

    super(initialValue, config);

    triggers.forEach((trigger) => {
      trigger.register({
        uid: this.uid,
        callback: async () => {
          this._setValueHandler(callback());
        },
      });
    });
  }
}

let counter = 0;
