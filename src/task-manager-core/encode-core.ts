import MD5 from "crypto-js/md5";

export class EncodeCore<EncodeDataType extends any[]> {
  constructor(protected _encodeConfig: EncodeCoreConfig<EncodeDataType>) {}

  protected _getHash(parameters: EncodeDataType) {
    const length = parameters.length;

    return MD5(
      this._encodeConfig.getParamsString
        ? this._encodeConfig.getParamsString(...parameters)
        : length === 0
        ? "default"
        : length === 1 && typeof parameters[0] === "object"
        ? EncodeCore.getObjectUniqueString(parameters[0])
        : JSON.stringify(parameters)
    ).toString();
  }

  static getObjectUniqueString(object: Record<string, any>) {
    return JSON.stringify(
      Object.entries(object).sort(([key1], [key2]) => key1.localeCompare(key2))
    );
  }
}

export type EncodeCoreConfig<EncodeDataType extends any[]> = {
  getParamsString?: (...params: EncodeDataType) => string;
};
