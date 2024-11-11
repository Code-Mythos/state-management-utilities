import { clear, createStore, del, get, set, UseStore } from "idb-keyval";

import { EncodeCore, EncodeCoreConfig } from "./encode-core";

export class CacheCore<
  CacheDataType,
  EncodeDataType extends any[]
> extends EncodeCore<EncodeDataType> {
  protected readonly _cacheStore: UseStore | undefined;

  constructor(protected _cacheConfig: CacheCoreConfig) {
    super({ getParamsString: _cacheConfig.getParamsString });

    try {
      this._cacheStore = this._cacheConfig?.enableCache
        ? createStore(
            this._cacheConfig?.cacheId ?? "db-default",
            "store-default"
          )
        : undefined;
    } catch (error) {
      // console.error(error);
    }
  }

  protected async _getCache(
    cacheKey: string
  ): Promise<TypeCacheRecord<CacheDataType> | undefined> {
    if (!this._cacheConfig.enableCache || !this._cacheStore) return undefined;

    const cache: TypeCacheRecord<CacheDataType> | undefined = await get(
      cacheKey,
      this._cacheStore
    );

    return this._isCacheExpired(cache) ? undefined : cache;
  }

  protected async _setCache(
    cacheKey: string,
    value: TypeCacheRecord<CacheDataType>
  ) {
    if (!this._cacheConfig.enableCache || !this._cacheStore) return;

    try {
      await set(cacheKey, value, this._cacheStore);
    } catch (error) {
      console.error(error);
    }
  }

  public async delCache(cacheKey: string) {
    if (this._cacheStore) del(cacheKey, this._cacheStore);
  }

  public async clearCache() {
    if (this._cacheStore) clear(this._cacheStore);
  }

  protected _isCacheExpired(cache: TypeCacheRecord<CacheDataType> | undefined) {
    return (
      !!cache &&
      !!this._cacheConfig.cacheExpiry &&
      this._cacheConfig.cacheExpiry > 0 &&
      Date.now() - cache.updatedAt > this._cacheConfig.cacheExpiry
    );
  }

  // protected _isCachePreventNewRequest(
  //   cache: TypeCacheRecord<CacheDataType> | undefined
  // ) {
  //   return (
  //     !!cache &&
  //     !!this._cacheConfig.cachePreventNewRequestDuration &&
  //     this._cacheConfig.cachePreventNewRequestDuration > 0 &&
  //     Date.now() - cache.updatedAt < this._cacheConfig.cachePreventNewRequestDuration
  //   );
  // }
}

export type TypeCacheRecord<T> = {
  data: T;
  updatedAt: number;
};

export type CacheCoreConfig = {
  enableCache?: boolean;
  cacheExpiry?: number;
  cacheId?: string;

  // cachePreventNewRequestDuration?: number;
} & EncodeCoreConfig<any[]>;
