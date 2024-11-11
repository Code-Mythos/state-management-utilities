import { manager } from '../src/index';

describe("State Manager: ", () => {
  describe("The 'register' method: ", () => {
    it("Should add a callback to the registered callback list.", () => {
      const uid = "***";
      const state = "TEST";
      const stateManager = manager(state);

      stateManager.register({ uid, callback() {} });

      const registeredUID = stateManager.registeredCallbacks[0];

      expect(registeredUID).toBe(uid);
    });
  });

  describe("The 'un-register' method: ", () => {
    it("Should remove the callback from the registered callback list.", () => {
      const uid = "***";
      const state = "TEST";
      const stateManager = manager(state);

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
      const stateManager = manager(state);

      expect(stateManager.value).toBe(state);
    });
  });

  describe("The 'set value' method: ", () => {
    it("Should update the recent value of the state.", () => {
      const state = "TEST";
      const stateManager = manager(state);
      const newState = "TEST-NEW";

      stateManager.value = newState;

      expect(stateManager.value).toBe(newState);
    });

    it("Should trigger the registered callback whenever the state is updated.", () => {
      const uid = "***";
      const state = "TEST";
      const newState = "TEST-NEW";
      const stateManager = manager(state);
      let counter = 1;

      stateManager.register({
        uid,
        callback() {
          counter += 1;
        },
      });

      stateManager.value = newState;

      expect(counter).toBe(2);
    });
  });

  describe("Options: ", () => {
    describe("onChange: ", () => {
      it("Should trigger 'onChange' callback whenever the state is updated.", () => {
        const state = "TEST";
        const newState = "TEST-NEW";
        const stateManager = manager(state, {
          onChange() {
            counter += 1;
          },
        });
        let counter = 1;

        stateManager.value = newState;

        expect(counter).toBe(2);
      });
    });
  });
});
