import React from "react";

import { StateManagerStoreConfigs } from "../store";
import { ReactStateManagerStore } from "./store";

export class ReactStateManagerForm<
  DataType extends Record<
    string,
    {
      data: any;
      error?: ErrorType;
      modified?: boolean;
      touched?: boolean;
    }
  >,
  ErrorType = string[] | undefined | null,
  Meta = Record<string, any>
> {
  protected readonly _KEYS: (keyof Required<DataType>)[];

  protected _fields: ReactStateManagerStore<DataType>;

  public get fields() {
    return this._fields.entities;
  }

  public get KEYS() {
    return [...this._KEYS];
  }

  public get meta() {
    // TODO: Clone?
    return (this._config.meta ?? {}) as Meta;
  }

  public get hooks() {
    return this._hooks;
  }

  public get value() {
    return this._fields.value;
  }

  public set value(newValues: DataType) {
    this._fields.value = newValues;
  }

  protected readonly _validators:
    | {
        [Key in keyof Required<DataType>]: (value: any) => void;
      }
    | undefined;

  protected readonly _hooks = Object.freeze({
    useField: <Key extends keyof DataType>(name: Key) => {
      const [{ modified, data: value, error, touched }, setField] =
        this._fields.entities[name].hooks.useState();

      const setValue = React.useCallback(
        (data: DataType[Key]["data"]) => {
          this._fields.entities[name].value = {
            data,
            touched: true,
            modified: true,
          } as DataType[Key];
        },
        [name]
      );

      const setAsTouched = React.useCallback(() => {
        const prev = this._fields.entities[name].value as any;

        prev.touched = true;

        this._fields.entities[name].value = {
          ...prev,
        };
      }, [name]);

      const setAsModified = React.useCallback(() => {
        const prev = this._fields.entities[name].value as any;

        prev.modified = true;

        this._fields.entities[name].value = {
          ...prev,
        };
      }, [name]);

      const setError = React.useCallback(
        (newError: ErrorType) => {
          const prev = this._fields.entities[name].value as any;

          prev.error = newError;

          this._fields.entities[name].value = {
            ...prev,
          };
        },
        [name]
      );

      const setTouched = React.useCallback(
        (newTouched: boolean) => {
          const prev = this._fields.entities[name].value as any;

          prev.touched = newTouched;

          this._fields.entities[name].value = {
            ...prev,
          };
        },
        [name]
      );

      const setModified = React.useCallback(
        (newModified: boolean) => {
          const prev = this._fields.entities[name].value as any;

          prev.modified = newModified;

          this._fields.entities[name].value = {
            ...prev,
          };
        },
        [name]
      );

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

        setField,

        _setValue: setField,
      };
    },

    useForm: () => {
      return this._fields.hooks.useState();
    },

    useIsModified: () => {
      const [fields] = this._fields.hooks.useState();

      const isModified = React.useMemo(
        () => Object.values(fields).some(({ modified }) => Boolean(modified)),
        [fields]
      );

      return [isModified] as [isModified: boolean];
    },

    useIsTouched: () => {
      const [fields] = this._fields.hooks.useState();

      const isTouched = React.useMemo(
        () => Object.values(fields).some(({ touched }) => Boolean(touched)),
        [fields]
      );

      return [isTouched] as [isTouched: boolean];
    },

    useHasErrors: () => {
      if (!this._config.hasError)
        throw new Error("hasError selector is not defined in the config");

      const [fields] = this._fields.hooks.useState();

      const hasErrors = React.useMemo(
        () => Object.values(fields).some(({ error }) => Boolean(error)),
        [fields]
      );

      return [hasErrors] as [hasErrors: boolean];
    },
  });

  public reset(values?: DataType) {
    if (!values) this._fields.reset();
    else this._fields.value = values;

    this._config.onReset?.();

    return this;
  }

  public setAllAsTouched() {
    const prev = this._fields.value;

    this._KEYS.forEach((key) => {
      prev[key].touched = true;
    });

    this._fields.value = { ...prev };

    return this;
  }

  public setAllAsModified() {
    const prev = this._fields.value;

    this._KEYS.forEach((key) => {
      prev[key].modified = true;
    });

    this._fields.value = { ...prev };

    return this;
  }

  public getModifiedValues(params?: {
    defaultFields?: (keyof Required<DataType>)[];
  }) {
    const record = this._fields.value;

    params?.defaultFields?.forEach((key) => {
      record[key].modified = true;
    });

    const modifiedValues: Partial<DataType> = {};

    this.KEYS.forEach((key) => {
      if (record[key].modified) {
        modifiedValues[key] = record[key].data;
      }
    });

    return modifiedValues;
  }

  public get hasErrors() {
    if (!this._config.hasError)
      throw new Error("hasError selector is not defined in the config");

    return Object.values(this._fields.value).some(({ error }) =>
      this._config.hasError?.(error)
    );
  }

  public get isModified() {
    return Object.values(this._fields.value).some(({ modified }) =>
      Boolean(modified)
    );
  }

  public get isTouched() {
    return Object.values(this._fields.value).some(({ touched }) =>
      Boolean(touched)
    );
  }

  hydrate(value: DataType) {
    return this._fields.hydrate(value);
  }

  public async fullFill(): Promise<any> {
    await this._fields.fulfill();

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
    this._KEYS = Object.keys(initialValues);

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

    const storeConfig: StateManagerStoreConfigs<{
      [Key in keyof Required<DataType>]: {
        data: DataType[Key];
        error?: ErrorType;
        modified?: boolean;
        touched?: boolean;
      };
    }> = this._KEYS.reduce(
      (acc, key) => {
        acc[key] = {
          ...this._config.storeConfig?.[key],

          onChange: (value: any) => {
            this._validators?.[key]?.(value);

            this._config.storeConfig?.[key]?.onChange?.(value);
          },
        };

        return acc;
      },
      {} as StateManagerStoreConfigs<{
        [Key in keyof Required<DataType>]: {
          data: DataType[Key];
          error?: ErrorType;
          modified?: boolean;
          touched?: boolean;
        };
      }>
    );

    this._fields = new ReactStateManagerStore<DataType>(
      initialValues,
      this._config.uid,
      storeConfig
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

export type ReactStateManagerFormConfig<
  DataType extends Record<string, any>,
  ErrorType = string[] | undefined | null,
  Meta = Record<string, any>
> = {
  uid: string;

  getValidator?: (
    fieldName: keyof DataType,
    form: ReactStateManagerForm<DataType, ErrorType>
  ) => (value: {
    data: any;
    error?: ErrorType;
    modified?: boolean;
    touched?: boolean;
  }) => void;

  onReset?: () => void;

  hasError?: (error: ErrorType | undefined) => boolean;

  meta?: Meta;

  storeConfig?: StateManagerStoreConfigs<{
    [Key in keyof Required<DataType>]: {
      data: DataType[Key];
      error?: ErrorType;
      modified?: boolean;
      touched?: boolean;
    };
  }>;
};
