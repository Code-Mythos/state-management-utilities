import React from "react";

import { Hydrated } from "../center";
import { TypeStateManagerConfigs } from "../state-manager";
import { StateManagerStoreConfigs } from "../store";
import { ReactStateManager } from "./state-manager";
import { ReactStateManagerStore } from "./store";

export class ReactStateManagerForm<
  DataType extends Record<string, any>,
  ErrorType = string[] | undefined | null,
  Meta = Record<string, any>
> {
  protected readonly _KEYS: (keyof Required<DataType>)[] = [];

  protected _fields: {
    [Key in keyof Required<DataType>]: Entities<DataType[Key], ErrorType>;
  };

  public get fields(): Readonly<{
    [Key in keyof Required<DataType>]: Entities<DataType[Key], ErrorType>;
  }> {
    return this._fields;
  }

  public get KEYS(): (keyof Required<DataType>)[] {
    return [...this._KEYS];
  }

  public get meta() {
    // TODO: Clone?
    return (this._config.meta ?? {}) as Meta;
  }

  public get hooks() {
    return this._hooks;
  }

  protected readonly _truthyValues: {
    [Key in keyof Required<DataType>]: true;
  };

  protected readonly _falsyValues: {
    [Key in keyof Required<DataType>]: false;
  };

  protected readonly _data: ReactStateManagerStore<DataType>;

  public get data() {
    return this._data.entities;
  }

  protected readonly _errors: ReactStateManagerStore<{
    [Key in keyof DataType]?: ErrorType;
  }>;

  public get errors() {
    return this._errors.entities;
  }

  protected readonly _touched: ReactStateManagerStore<{
    [Key in keyof DataType]?: boolean;
  }>;

  public get touched() {
    return this._touched.entities;
  }

  protected readonly _modified: ReactStateManagerStore<{
    [Key in keyof DataType]?: boolean;
  }>;

  public get modified() {
    return this._modified.entities;
  }

  public get value(): {
    data: DataType;
    errors: { [Key in keyof DataType]: ErrorType | undefined };
    touched: { [Key in keyof DataType]: boolean | undefined };
    modified: { [Key in keyof DataType]: boolean | undefined };
  } {
    return {
      data: this._data.value,
      errors: this._errors.value,
      touched: this._touched.value,
      modified: this._modified.value,
    };
  }

  public set value(newValues: {
    data?: Partial<DataType>;
    errors?: { [Key in keyof DataType]?: ErrorType | undefined };
    touched?: { [Key in keyof DataType]?: boolean | undefined };
    modified?: { [Key in keyof DataType]?: boolean | undefined };
  }) {
    const previousValues = this.value;

    if (newValues.data) {
      this._data.value = { ...previousValues.data, ...newValues.data };
    }

    if (newValues.errors) {
      this._errors.value = { ...previousValues.errors, ...newValues.errors };
    }

    if (newValues.touched) {
      this._touched.value = { ...previousValues.touched, ...newValues.touched };
    }

    if (newValues.modified) {
      this._modified.value = {
        ...previousValues.modified,
        ...newValues.modified,
      };
    }
  }

  public update(
    updater:
      | {
          data?: Partial<DataType>;
          errors?: { [Key in keyof DataType]?: ErrorType | undefined };
          touched?: { [Key in keyof DataType]?: boolean | undefined };
          modified?: { [Key in keyof DataType]?: boolean | undefined };
        }
      | ((prev: {
          data: DataType;
          errors: { [Key in keyof DataType]: ErrorType | undefined };
          touched: { [Key in keyof DataType]: boolean | undefined };
          modified: { [Key in keyof DataType]: boolean | undefined };
        }) => {
          data?: Partial<DataType>;
          errors?: { [Key in keyof DataType]?: ErrorType | undefined };
          touched?: { [Key in keyof DataType]?: boolean | undefined };
          modified?: { [Key in keyof DataType]?: boolean | undefined };
        })
  ) {
    const previousValues = this.value;

    const newValues =
      typeof updater === "function" ? updater(previousValues) : updater;

    if (newValues.data) {
      this._data.value = { ...previousValues.data, ...newValues.data };
    }

    if (newValues.errors) {
      this._errors.value = { ...previousValues.errors, ...newValues.errors };
    }

    if (newValues.touched) {
      this._touched.value = { ...previousValues.touched, ...newValues.touched };
    }

    if (newValues.modified) {
      this._modified.value = {
        ...previousValues.modified,
        ...newValues.modified,
      };
    }

    return this;
  }

  protected readonly _validators:
    | {
        [Key in keyof Required<DataType>]: (value: any) => void;
      }
    | undefined;

  protected readonly _hooks = Object.freeze({
    useField: <Key extends keyof DataType>(name: Key) => {
      const [touched, setTouched] =
        this._touched.entities[name].hooks.useState();
      const [value, _setValue] = this._data.entities[name].hooks.useState();
      const [error, setError] = this._errors.entities[name].hooks.useState();
      const [modified, setModified] =
        this._modified.entities[name].hooks.useState();

      const setValue = React.useCallback(
        (newValue: DataType[Key]) => {
          // Error should be cleared first. The data change would trigger validation and subsequently result in new error state. If we clear it after assigning a new value, the validation would be cleared.
          this._errors.entities[name].value = undefined;

          this._data.entities[name].value = newValue;
          this._modified.entities[name].value = true;
          this._touched.entities[name].value = true;
        },
        [name]
      );

      const setAsTouched = React.useCallback(() => {
        this._touched.entities[name].value = true;
      }, [name]);

      const setAsModified = React.useCallback(() => {
        this._modified.entities[name].value = true;
      }, [name]);

      return {
        value,
        setValue,
        error,
        setError,
        touched,
        setTouched,
        modified,
        setModified,

        setAsTouched,
        setAsModified,

        _setValue,
      };
    },

    useData: () => {
      return this._data.hooks.useState();
    },

    useErrors: () => {
      return this._errors.hooks.useState();
    },

    useTouched: () => {
      return this._touched.hooks.useState();
    },

    useModified: () => {
      return this._modified.hooks.useState();
    },

    useForm: () => {
      const [data, setData] = this._data.hooks.useState();
      const [errors, setErrors] = this._errors.hooks.useState();
      const [touched, setTouched] = this._touched.hooks.useState();
      const [modified, setModified] = this._modified.hooks.useState();

      return {
        data,
        setData,
        errors,
        setErrors,
        touched,
        setTouched,
        modified,
        setModified,
      };
    },

    useIsModified: () => {
      const [modified] = this._modified.hooks.useState();

      const isModified = React.useMemo(
        () => Object.values(modified).some((value) => !!value),
        [modified]
      );

      return [isModified] as [isModified: boolean];
    },

    useIsTouched: () => {
      const [touched] = this._touched.hooks.useState();

      const isTouched = React.useMemo(
        () => Object.values(touched).some((value) => !!value),
        [touched]
      );

      return [isTouched] as [isTouched: boolean];
    },

    useHasErrors: () => {
      if (!this._config.hasError)
        throw new Error("hasError selector is not defined in the config");

      const [errors] = this._errors.hooks.useState();

      const hasErrors = React.useMemo(
        () => Object.values(errors).some(this._config.hasError!),
        [errors]
      );

      return [hasErrors] as [hasErrors: boolean];
    },
  });

  public reset(
    resetValues: {
      data?: Partial<DataType>;

      modified?: {
        [Key in keyof DataType]?: boolean;
      };
      touched?: {
        [Key in keyof DataType]?: boolean;
      };
      errors?: {
        [Key in keyof DataType]?: ErrorType;
      };
    } = {}
  ) {
    // Error should be cleared first. The data change would trigger validation and subsequently result in new error state. If we clear it after assigning a new value, the validation would be cleared.
    this._errors.value = {
      ...this._errors.initialValues,
      ...resetValues.errors,
    };

    this._data.value = { ...this._data.initialValues, ...resetValues.data };

    this._touched.value = {
      ...this._touched.initialValues,
      ...resetValues.touched,
    };

    this._modified.value = {
      ...this._modified.initialValues,
      ...resetValues.modified,
    };

    this._config.onReset?.();
  }

  public setAllAsTouched() {
    this._touched.value = { ...this._truthyValues };
  }

  public setAllAsUntouched() {
    this._touched.value = { ...this._falsyValues };
  }

  public setAllAsModified() {
    this._modified.value = { ...this._truthyValues };
  }

  public setAllAsUnmodified() {
    this._modified.value = { ...this._falsyValues };
  }

  public getModifiedValues(
    {
      defaultFields,
    }: {
      defaultFields: (keyof Required<DataType>)[];
    } = { defaultFields: [] }
  ) {
    const items = this._modified.value;

    defaultFields.forEach((key) => {
      items[key] = true;
    });

    const dataValues = this._data.value;

    const modifiedValues: Partial<DataType> = {};

    this.KEYS.forEach((key) => {
      if (items[key]) {
        modifiedValues[key as keyof DataType] = dataValues[
          key as keyof DataType
        ] as any;
      }
    });

    return modifiedValues;
  }

  public get hasErrors() {
    if (!this._config.hasError)
      throw new Error("hasError selector is not defined in the config");

    return Object.values(this._errors.value).some(this._config.hasError);
  }

  public get isModified() {
    return Object.values(this._modified.value).some((value) => !!value);
  }

  public get isTouched() {
    return Object.values(this._touched.value).some((value) => !!value);
  }

  hydrate(value: {
    data: DataType;
    errors: { [Key in keyof DataType]?: ErrorType };
    touched: { [Key in keyof DataType]?: boolean };
    modified: { [Key in keyof DataType]?: boolean };
  }) {
    const data = this._data.hydrate(value.data ?? {});
    const errors = this._errors.hydrate(value.errors ?? {});
    const touched = this._touched.hydrate(value.touched ?? {});
    const modified = this._modified.hydrate(value.modified ?? {});

    return {
      update: (record: Hydrated["data"]) => {
        data.update(record);
        errors.update(record);
        touched.update(record);
        modified.update(record);
      },

      value,
    };
  }

  public async fulfill(): Promise<any> {
    await Promise.all([
      this._data.fulfill(),
      this._errors.fulfill(),
      this._modified.fulfill(),
      this._touched.fulfill(),
    ]);

    return this;
  }

  constructor(
    initialValues: { [Key in keyof Required<DataType>]: DataType[Key] },
    protected _config: ReactStateManagerFormConfig<
      DataType,
      ErrorType,
      Meta
    > = {
      uid: `RSMF-#${++counter}`,
    }
  ) {
    const _KEYS = Object.keys(initialValues);

    this._KEYS = _KEYS;

    if (this._config.getValidator) {
      this._validators = this._KEYS.reduce(
        (acc, key) => {
          acc[key] = this._config.getValidator!(key, this as any);

          return acc;
        },
        {} as {
          [Key in keyof Required<DataType>]: (value: any) => void;
        }
      );
    }

    this._truthyValues = this._KEYS.reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as {
        [Key in keyof Required<DataType>]: true;
      }
    );

    this._falsyValues = this._KEYS.reduce(
      (acc, key) => {
        acc[key] = false;
        return acc;
      },
      {} as {
        [Key in keyof Required<DataType>]: false;
      }
    );

    const undefinedValues = this._KEYS.reduce(
      (acc, key) => {
        acc[key] = undefined;
        return acc;
      },
      {} as {
        [Key in keyof Required<DataType>]: undefined;
      }
    );

    this._data = new ReactStateManagerStore(
      initialValues,
      `${this._config.uid}/data`,

      this._KEYS.reduce((acc, key) => {
        acc[key] = {
          ...this._config.data?.[key],

          onChange: (value: any) => {
            this._validators?.[key]?.(value);

            this._config.data?.[key]?.onChange?.(value);
          },
        };

        return acc;
      }, {} as StateManagerStoreConfigs<DataType>)
    );

    this._errors = new ReactStateManagerStore<{
      [Key in keyof DataType]?: ErrorType;
    }>(undefinedValues, `${this._config.uid}/errors`, this._config.errors);

    this._touched = new ReactStateManagerStore<{
      [Key in keyof DataType]?: boolean;
    }>(undefinedValues, `${this._config.uid}/touched`, this._config.touched);

    this._modified = new ReactStateManagerStore<{
      [Key in keyof DataType]?: boolean;
    }>(undefinedValues, `${this._config.uid}/modified`, this._config.modified);

    this._fields = this.KEYS.reduce(
      (acc, key) => {
        acc[key] = new Entities(
          this._data.entities[key] as any,
          this._errors.entities[key] as any,
          this._modified.entities[key],
          this._touched.entities[key]
        );

        return acc;
      },
      {} as {
        [Key in keyof Required<DataType>]: Entities<DataType[Key], ErrorType>;
      }
    );
  }
}

let counter = 0;

export function form<
  DataType extends Record<string, any>,
  ErrorType = string[] | undefined | null,
  Meta = Record<string, any>
>(
  initialValues: { [Key in keyof Required<DataType>]: DataType[Key] },
  config?: ReactStateManagerFormConfig<DataType, ErrorType, Meta>
): ReactStateManagerForm<DataType, ErrorType, Meta> {
  return new ReactStateManagerForm(initialValues, config);
}

class Entities<DataType, ErrorType> {
  constructor(
    public readonly data: ReactStateManager<DataType>,
    public readonly error: ReactStateManager<ErrorType | undefined>,
    public readonly modified: ReactStateManager<boolean | undefined>,
    public readonly touched: ReactStateManager<boolean | undefined>
  ) {}

  public get values(): EntitiesType<DataType, ErrorType> {
    return {
      data: this.data.value,
      error: this.error.value,
      modified: this.modified.value,
      touched: this.touched.value,
    };
  }

  public set values(values: EntitiesType<DataType, ErrorType>) {
    this.data.value = values.data;
    this.error.value = values.error;
    this.modified.value = values.modified;
    this.touched.value = values.touched;
  }

  public update(
    updater: (
      prev: EntitiesType<DataType, ErrorType>
    ) => EntitiesType<DataType, ErrorType>
  ) {
    const newState = updater(this.values);

    this.values = newState;

    return this;
  }
}

type EntitiesType<DataType, ErrorType> = {
  data: DataType;
  error: ErrorType | undefined;
  modified: boolean | undefined;
  touched: boolean | undefined;
};

export type ReactStateManagerFormConfig<
  DataType extends Record<string, any>,
  ErrorType = string[] | undefined | null,
  Meta = Record<string, any>
> = {
  uid: string;

  getValidator?: (
    fieldName: keyof DataType,
    form: ReactStateManagerForm<DataType, ErrorType>
  ) => (value: any) => void;

  onReset?: () => void;

  hasError?: (error: ErrorType | undefined) => boolean;

  meta?: Meta;

  errors?: {
    [Key in keyof DataType]?: StateConfig<ErrorType | undefined>;
  };

  touched?: {
    [Key in keyof DataType]?: StateConfig<boolean | undefined>;
  };

  modified?: {
    [Key in keyof DataType]?: StateConfig<boolean | undefined>;
  };

  data?: {
    [Key in keyof DataType]?: StateConfig<DataType[Key]>;
  };
};

type StateConfig<DataType> = Omit<TypeStateManagerConfigs<DataType>, "uid">;
