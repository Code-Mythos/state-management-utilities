import type { HydratedEntry } from "./center";
import type { TypeStateManagerConfigs } from "./state-manager";
import cloneDeep from "lodash.clonedeep";

import { center } from "./center";
import { StateManager } from "./state-manager";

export class StoreManager<
  DataType extends Record<string, any>,
  Entities extends {
    [Key in keyof Required<DataType>]: StateManager<DataType[Key]>;
  }
> {
  protected _initialValues: {
    [Key in keyof Required<DataType>]: DataType[Key];
  };
  protected _KEYS: (keyof DataType)[];
  protected _initializeEntity<Key extends keyof DataType>(
    initialValue: DataType[Key],
    config: TypeStateManagerConfigs<DataType[Key]>
  ): any {
    return new StateManager(initialValue, config);
  }

  public readonly entities: Entities;

  constructor(
    initialValues: { [Key in keyof Required<DataType>]: DataType[Key] },
    protected readonly _uid: string = `SMS-#${++counter}`,
    protected readonly _config: StoreManagerConfigs<DataType> = {}
  ) {
    this._initialValues = initialValues;
    this._KEYS = Object.keys(initialValues);

    this.entities = Object.freeze(
      this._KEYS.reduce((acc, key) => {
        acc[key as keyof DataType] = this._initializeEntity(
          initialValues[key],
          {
            ...this._config[key],
            uid: `${this._uid}/${key as string}`,
          }
        );

        return acc;
      }, {} as Entities)
    );
  }

  public set value(value: Partial<DataType>) {
    for (const key in value) {
      this.entities[key].value = value[key] as any;
    }
  }

  public get value(): Required<DataType> {
    const valueClone: Required<DataType> = {} as any;

    for (const key in this.entities) {
      if (this.entities[key]) valueClone[key] = this.entities[key].value as any;
    }

    return valueClone;
  }

  public update(
    updater:
      | Partial<DataType>
      | ((prev: Required<DataType>) => Partial<DataType>)
  ) {
    this.value = typeof updater === "function" ? updater(this.value) : updater;

    return this;
  }

  public reset() {
    for (const key in this.entities) {
      if (this.entities[key]) this.entities[key].reset();
    }
  }

  public get initialValues() {
    return center.disableCloning
      ? this._initialValues
      : cloneDeep(this._initialValues);
  }

  public async fulfill() {
    await Promise.all(this._KEYS.map((key) => this.entities[key].fulfill()));

    return this;
  }

  hydrate(value: DataType): HydratedEntry {
    return {
      update: (record) => {
        for (const key in this.entities) {
          if (value[key] === undefined) continue;

          record[this.entities[key].uid] = { value: value[key] };
        }
      },

      value,
    };
  }
}

let counter = 0;

export type StoreManagerConfigs<DataType> = {
  [Key in keyof DataType]?: Omit<TypeStateManagerConfigs<DataType[Key]>, "uid">;
};
