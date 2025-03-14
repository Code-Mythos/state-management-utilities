import type { Hydrated } from "src/center";

import React from "react";

import { StateManager, TypeStateManagerConfigs } from "../state-manager";
import { useDehydrate } from "./dehydrate";

export class ReactStateManager<StateType> extends StateManager<StateType> {
  protected _hooks = Object.freeze({
    useState: () => {
      const uID = React.useId();

      const dehydrated = useDehydrate();
      const hydratedValue = dehydrated?.data?.[this.uid]?.value;

      const [state, setInternalState] = React.useState<StateType>(
        hydratedValue === undefined ? this.value : hydratedValue
      );

      React.useEffect(() => {
        this.register({
          uid: uID,
          callback: (newValue) => {
            setInternalState(newValue);
          },
        });

        return () => {
          this.unregister({ uid: uID });
        };
      }, [uID]);

      const setState = React.useCallback((newState: StateType) => {
        this.value = newState;
      }, []);

      return [state, setState, uID] as [
        StateType,
        (newState: StateType) => void,
        string
      ];
    },
  });

  public get hooks() {
    return this._hooks;
  }
}

export function manager<StateType>(
  initialState: StateType,
  configs?: TypeStateManagerConfigs<StateType>
): ReactStateManager<StateType> {
  return new ReactStateManager(initialState, configs);
}
