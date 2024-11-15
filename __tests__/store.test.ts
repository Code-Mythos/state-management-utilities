import { StateManager, TypeStateManagerConfigs } from '../src/state';
import { StateManagerStore, StateManagerStoreConfigs } from '../src/store';

describe("StateManagerStore", () => {
  type TestDataType = {
    a: number;
    b: string;
  };

  let initialValues: TestDataType;
  let config: StateManagerStoreConfigs<TestDataType>;
  let store: StateManagerStore<TestDataType, any>;

  beforeEach(() => {
    initialValues = { a: 1, b: "test" };

    store = new StateManagerStore(initialValues, "test-uid", config);
  });

  test("should initialize entities correctly", () => {
    expect(store.entities.a.value).toBe(1);
    expect(store.entities.b.value).toBe("test");
  });

  test("should set value correctly", () => {
    store.value = { a: 2, b: "updated" };
    expect(store.entities.a.value).toBe(2);
    expect(store.entities.b.value).toBe("updated");
  });

  test("should reset entities correctly", () => {
    store.value = { a: 2, b: "updated" };
    store.reset();
    expect(store.entities.a.value).toBe(1);
    expect(store.entities.b.value).toBe("test");
  });
});
