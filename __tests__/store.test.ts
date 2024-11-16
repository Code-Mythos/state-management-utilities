import { StateManager } from "../src/state-manager";
import { StateManagerStore } from "../src/store";

describe("StateManagerStore", () => {
  type TestDataType = {
    a: number;
    b: string;
  };

  const isChanged = {
    a: false,
    b: false,
  };
  let uid: string;
  let initialValues: TestDataType;
  let store: StateManagerStore<TestDataType, any>;

  beforeEach(() => {
    isChanged.a = false;
    isChanged.b = false;

    initialValues = { a: 1, b: "test" };

    uid = Date.now().toString();

    store = new StateManagerStore<
      { a: number; b: string },
      {
        a: StateManager<number>;
        b: StateManager<string>;
      }
    >(initialValues, uid, {
      a: {
        onChange() {
          isChanged.a = true;
        },
      },
      b: {
        onChange() {
          isChanged.b = true;
        },
      },
    });
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
    const newValue = { a: 2, b: "changed" };
    store.value = newValue;

    await store.fulfill();

    expect(store.entities.a.value).toBe(newValue.a);
    expect(store.entities.b.value).toBe(newValue.b);
  });

  it("should get hydrated values correctly", () => {
    const hydrated = store.hydrated;
    expect(hydrated[`${uid}/a`]).toBe(1);
    expect(hydrated[`${uid}/b`]).toBe("test");
  });
});
