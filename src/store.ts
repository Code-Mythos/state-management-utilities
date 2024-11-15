import { StateManager, TypeStateManagerConfigs } from "./index";

export class StateManagerStore<
  DataType extends Record<string, any>,
  Entities extends {
    [Key in keyof Required<DataType>]: StateManager<DataType[Key]>;
  }
> {
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
    protected readonly _config: StateManagerStoreConfigs<DataType> = {}
  ) {
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

  public set value(value: DataType) {
    for (const key in this.entities) {
      if (this.entities[key]) this.entities[key].value = value?.[key] as any;
    }
  }

  public get value(): DataType {
    const valueClone: DataType = {} as any;

    for (const key in this.entities) {
      if (this.entities[key]) valueClone[key] = this.entities[key].value as any;
    }

    return valueClone;
  }

  public reset() {
    for (const key in this.entities) {
      if (this.entities[key]) this.entities[key].reset();
    }
  }

  public async fullFill() {
    return await Promise.all(
      this._KEYS.map((key) => this.entities[key].fullFill())
    );
  }

  public get hydrated() {
    const hydratedClone: Record<string, any> = {};

    for (const key in this.entities) {
      hydratedClone[this.entities[key].uid] = this.entities[key].value;
    }

    return hydratedClone;
  }
}

let counter = 0;

export type StateManagerStoreConfigs<DataType> = {
  [Key in keyof DataType]?: Omit<TypeStateManagerConfigs<DataType[Key]>, "uid">;
};
