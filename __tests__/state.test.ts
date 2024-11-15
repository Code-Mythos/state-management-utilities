import { StateManager } from '../src';

describe("State Manager: ", () => {
  describe("The trigger method: ", () => {
    it("Should trigger the registered callbacks and onChange event.", async () => {
      const uid = Date.now().toString();
      const state = "TEST";
      const stateManager = new StateManager(state);
      let counter = 1;

      stateManager.register({
        uid,
        callback() {
          counter += 1;
        },
      });

      expect(counter).toBe(1);

      stateManager.trigger();

      await stateManager.fullFill();

      expect(counter).toBe(2);
    });
  });

  describe("The reset method: ", () => {
    it("Should reset the state to the initial value.", () => {
      const stateManager = new StateManager(1);

      stateManager.set((prev) => prev + 1);

      stateManager.reset();

      expect(stateManager.value).toBe(1);
    });
  });

  describe("The set method: ", () => {
    it("Should set the value of the state.", () => {
      const stateManager = new StateManager(1);

      stateManager.set((prev) => prev + 1);

      expect(stateManager.value).toBe(2);
    });
  });

  describe("The get hydrated value: ", () => {
    it("Should return an object with key as the UID and value as the state.", () => {
      const uid = Date.now().toString();
      const state = "TEST";
      const stateManager = new StateManager(state, { uid });

      expect(stateManager.hydrated[uid]).toEqual(state);
    });
  });

  describe("The 'register' method: ", () => {
    it("Should add a callback to the registered callback list.", () => {
      const uid = Date.now().toString();
      const state = "TEST";
      const stateManager = new StateManager(state);

      stateManager.register({ uid, callback() {} });

      const registeredUID = stateManager.registeredCallbacks[0];

      expect(registeredUID).toBe(uid);
    });

    it("Should throw an error if the UID is already registered.", () => {
      const uid = Date.now().toString();
      const state = "TEST";
      const stateManager = new StateManager(state);

      stateManager.register({ uid, callback() {} });

      expect(() => stateManager.register({ uid, callback() {} })).toThrow();
    });
  });

  describe("The 'un-register' method: ", () => {
    it("Should remove the callback from the registered callback list.", () => {
      const uid = Date.now().toString();
      const state = "TEST";
      const stateManager = new StateManager(state);

      stateManager.register({ uid, callback() {} });

      const isCallbackAdded = stateManager.registeredCallbacks.length === 1;

      stateManager.unregister({ uid });

      const isCallbackRemoved = stateManager.registeredCallbacks.length === 0;

      expect(isCallbackAdded && isCallbackRemoved).toBe(true);
    });
  });

  describe("The 'get value' method: ", () => {
    it("Should return the recent value of the state.", () => {
      const state = "TEST";
      const stateManager = new StateManager(state);

      expect(stateManager.value).toBe(state);
    });
  });

  describe("The 'set value' method: ", () => {
    it("Should update the recent value of the state.", () => {
      const state = "TEST";
      const stateManager = new StateManager(state);
      const newState = "TEST-NEW";

      stateManager.value = newState;

      expect(stateManager.value).toBe(newState);
    });

    it("Should trigger the registered callback whenever the state is updated.", async () => {
      const uid = Date.now().toString();
      const state = "TEST";
      const newState = "TEST-NEW";
      const stateManager = new StateManager(state);
      let counter = 1;

      stateManager.register({
        uid,
        callback() {
          counter += 1;
        },
      });

      stateManager.value = newState;

      await stateManager.fullFill();

      expect(counter).toBe(2);
    });
  });

  describe("Options: ", () => {
    describe("onChange: ", () => {
      it("Should trigger 'onChange' callback whenever the state is updated.", async () => {
        const uid = Date.now().toString();
        const state = "TEST";
        let counter = 1;

        new StateManager(state, {
          uid,
          onChange() {
            counter += 1;
          },
        });

        expect(counter).toBe(2);
      });
    });
  });
});
