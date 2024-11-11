import {
  EncodeCore,
  EncodeCoreConfig,
} from "../src/task-manager-core/encode-core";

describe("EncodeCore", () => {
  let encodeCore: EncodeCore<any[]>;

  beforeEach(() => {
    const config: EncodeCoreConfig<any[]> = {
      getParamsString: (...params) => params.join("-"),
    };
    encodeCore = new EncodeCore(config);
  });

  it("should generate hash for empty parameters", () => {
    const hash = encodeCore["_getHash"]([]);
    expect(hash).toBe("d41d8cd98f00b204e9800998ecf8427e"); // MD5 hash for "default"
  });

  it("should generate unique string for object", () => {
    const uniqueString = EncodeCore.getObjectUniqueString({ b: 2, a: 1 });
    expect(uniqueString).toBe('[["a",1],["b",2]]');
  });
});
