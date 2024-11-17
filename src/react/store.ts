import type { TypeStateManagerConfigs } from "src/state-manager";

import { produce } from 'immer';
import React from 'react';

import { StateManagerStore, StateManagerStoreConfigs } from '../store';
import { useDehydrate } from './dehydrate';
import { ReactStateManager } from './state-manager';

export class ReactStateManagerStore<
  DataType extends Record<string, any>
> extends StateManagerStore<
  DataType,
  {
    [Key in keyof Required<DataType>]: ReactStateManager<DataType[Key]>;
  }
> {
  protected override _initializeEntity<Key extends keyof DataType>(
    initialValue: DataType[Key],
    config: TypeStateManagerConfigs<DataType[Key]>
  ) {
    return new ReactStateManager(initialValue, config);
  }

  protected _hooks = Object.freeze({
    useState: () => {
      const uid = React.useId();

      useDehydrate();

      const [state, setStateInternal] = React.useState(this.value);

      React.useEffect(() => {
        for (const key in this.entities) {
          if (!this.entities[key]) continue;
          this.entities[key].register({
            uid,
            callback: (newValue) => {
              setStateInternal((prev) =>
                produce<DataType, DataType>(prev, (draft) => {
                  draft[key] = newValue;
                  return draft;
                })
              );
            },
          });
        }

        return () => {
          for (const key in this.entities) {
            if (!this.entities[key]) continue;
            this.entities[key].unregister({ uid });
          }
        };
      }, [uid]);

      const setState = React.useCallback((newValue: DataType) => {
        this.value = newValue;
      }, []);

      return [state, setState] as [
        state: DataType,
        setState: (newValue: DataType) => void
      ];
    },
  });

  public get hooks() {
    return this._hooks;
  }
}

export function store<DataType extends Record<string, any>>(
  initialValues: { [Key in keyof Required<DataType>]: DataType[Key] },
  uid?: string,
  config?: StateManagerStoreConfigs<DataType>
): ReactStateManagerStore<DataType> {
  return new ReactStateManagerStore(initialValues, uid, config);
}
