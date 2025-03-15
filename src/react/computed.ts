import React from "react";

import { Computed } from "../computed";
import { TypeStateManagerConfigs } from "../state-manager";
import { useDehydrate } from "./dehydrate";
import { ReactStateManager } from "./state-manager";

export class ReactComputed<DataType> extends Computed<DataType> {
  protected _hooks = Object.freeze({
    useState: () => {
      const uid = React.useId();

      useDehydrate();

      const [state, setInternalState] = React.useState(this.value);

      React.useEffect(() => {
        this.register({
          uid,
          callback: (newValue) => setInternalState(newValue),
        });

        return () => {
          this.unregister({ uid });
        };
      }, [uid]);

      const setState = React.useCallback((newState: any) => {
        throw new Error(
          "Computed state manager value cannot be set directly.",
          {
            cause: {
              uid: this.uid,
            },
          }
        );
      }, []);

      return [state, setState] as [DataType, (newState: DataType) => void];
    },
  });

  public get hooks() {
    return this._hooks;
  }
}

export function computed<Callback extends () => any>(
  callback: Callback,
  triggers: (ReactStateManager<any> | ReactComputed<any>)[],
  config?: TypeStateManagerConfigs<ReturnType<Callback>>
) {
  return new ReactComputed(callback, triggers, config);
}
