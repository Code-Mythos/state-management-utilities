import { StateManagerStore, StateManagerStoreConfigs } from "../src/store";

describe("StateManagerStore", () => {
  type TestDataType = {
    a: number;
    b: string;
  };

  let uid: string;
  let initialValues: TestDataType;
  let store: StateManagerStore<TestDataType, any>;

  beforeEach(() => {
    initialValues = { a: 1, b: "test" };

    uid = Date.now().toString();

    store = new StateManagerStore(initialValues, uid);
  });

  it("should initialize entities correctly", () => {
    expect(store.entities.a.value).toBe(1);
    expect(store.entities.b.value).toBe("test");
  });

  it("should set value correctly", () => {
    store.value = { a: 2, b: "changed" };

    expect(store.entities.a.value).toBe(2);
    expect(store.entities.b.value).toBe("changed");
  });

  it("should get value correctly", () => {
    expect(store.value.a).toEqual(initialValues.a);
    expect(store.value.b).toEqual(initialValues.b);
  });

  it("should reset entities correctly", () => {
    store.value = { a: 2, b: "changed" };
    store.reset();
    expect(store.entities.a.value).toBe(initialValues.a);
    expect(store.entities.b.value).toBe(initialValues.b);
  });

  it("should fulfill entities correctly", async () => {
    store.value = { a: 2, b: "changed" };

    await store.fulfill();

    expect(store.entities.a.value).toBe(initialValues.a);
    expect(store.entities.b.value).toBe(initialValues.b);
  });

  it("should get hydrated values correctly", () => {
    const hydrated = store.hydrated;
    expect(hydrated[`${uid}/a`]).toBe(1);
    expect(hydrated[`${uid}/b`]).toBe("test");
  });
});
