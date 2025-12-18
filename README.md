# State Management Utilities

This package provides state-management utilities to manage applications efficiently and consistently.
Although it is based on a decentralized state-management methodology, it also includes a centralized tracking, monitoring, and management system.
By 'decentralized', we mean that state managers are not restricted to being defined or invoked only within React components, hooks, functions, or objects; they can be defined or invoked anywhere.
Given these advanced features, it is an excellent solution for managing state across a range of modern applications, from small projects to large-scale systems.
Furthermore, it is designed to be lightweight, flexible, and easy to use.
It is also based on code-splitting principles.
Therefore, it is suitable for server-side rendering (SSR) and static site generation (SSG) applications.
The React JS utilities are located in the "react" directory. The React JS utilities provides hooks to interact with the state managers defined using this package.

## Installation

You can install the package npm using the following command:

```cmd
npm install state-management-utilities
```

## State Manager

The main building block of this package is the State-Manager class.
The first parameter of the StateManager class constructor specifies the initialValue.
The second parameter is a configuration object that includes uid, onChange, and disableCloning options.
The uid is a unique identifier for the state manager instance.
It helps monitor the state manager's value as it changes over time.
onChange is a callback that is executed whenever the state manager's value changes.
It receives the state manager's new value as its parameter.
The disableCloning parameter disables the class's cloning behavior when retrieving its current value.
By default, it uses the deep-clone method from lodash to return a value.
If the state manager's value is large, creating a deep clone can degrade system performance.
If you are sure the data won't change while in use, disable cloning to improve performance; otherwise keep cloning enabled to avoid accidental mutations.

```js
import { StateManager } from "state-management-utilities";
const count = new StateManager(0, {
  uid: "state-unique-identifier",
  onChange: (newValue) => {
    console.log(`State changed to ${newValue}`);
  },
  disableCloning: false,
});

// Accessing and updating the state manager's value
console.log(count.value); // Get current value
count.value = 5; // Update value

// Register a callback for value changes
count.register({
  uid: "callback-unique-identifier",
  callback: (newValue) => {
    console.log(`Callback: State changed to ${newValue}`);
  },
});

// Unregister a previously registered callback
count.unregister({ uid: "callback-unique-identifier" });

// Trigger all registered callbacks manually
count.trigger();

//  Get registered callbacks
console.log(count.registeredCallbacks);

// The update method updates the state manager's value using an updater function that receives the current value and returns the updated one. This method uses the produce function from the immer package.
count.update((currentValue) => currentValue + 1);

// The reset method restores the state manager's value to the initialValue specified when the state manager was created.
count.reset();

// The initialValue getter returns the initialValue defined when the state manager was created.
console.log(count.initialValue);

// The hydrate method takes a value and returns an object that includes the update method and the value itself. This object is used to create the hydrated state of the application.
const hydrate = count.hydrate(10);
```

```js
// React version
import { ReactStateManager, manager } from "state-management-utilities";
const count = new ReactStateManager(0);
const name = manager("John Doe");

const [countValue, setCountValue] = count.hooks.useState();
const [nameValue, setNameValue] = name.hooks.useState();
```

## Computed Manager

The Computed manager generates a new value by executing the provided callback whenever any State-Manager or Computed instance in its dependency array changes.
The computed manager class extends the State-Manager class.
However, its constructor accepts a callback as its first parameter.
This callback returns a value that will be assigned to the computed value.
As its second parameter, the constructor receives a dependency array of StateManager or Computed instances; changes to any dependency trigger recalculation of the computed value.
The constructor's third parameter is a configuration object similar to that of the StateManager class.
With the Computed class, you cannot set the value manually; the value changes only via the callback when any dependency in the array changes.

```js
import { StateManager, ComputedManager } from "state-management-utilities";
const firstName = new StateManager("John");
const lastName = new StateManager("Doe");

const fullName = new ComputedManager(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName],
  {
    uid: "full-name-computed",
    onChange: (newValue) => {
      console.log(`Full name changed to ${newValue}`);
    },
    disableCloning: false,
  }
);
```

```js
// React version
import {
  ReactStateManager,
  ReactComputedManager,
} from "state-management-utilities";
const firstName = new ReactStateManager("John");
const lastName = new ReactStateManager("Doe");

const fullName = new ReactComputedManager(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

const [fullNameValue] = fullName.hooks.useState();
```

```js
// React version with builtin functions
import { manager, computed } from "state-management-utilities";
const firstName = manager("John");
const lastName = manager("Doe");

const fullName = computed(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

const [fullNameValue] = fullName.hooks.useState();
```

## Store Manager

The Store class lets you define and manage multiple state managers at once.
Its constructor accepts initialValues, an object that maps keys to the initial value for each state-manager.
The constructor's second parameter is uid, which is used for monitoring purposes.
The constructor's third parameter is a configuration object that provides per-manager settings (excluding uid).
Each field's uid is derived by combining the field key from initialValues with the store's uid.

```js
import { StoreManager } from "state-management-utilities";
const store = new StoreManager(
    {
        firstName: "John",
        lastName: "Doe",
    },
    "store-unique-identifier",
    {
        firstName: {
            onChange: (newValue) => {
                console.log(`First name changed to ${newValue}`);
            },
        },
        lastName: {
            onChange: (newValue) => {
                console.log(`Last name changed to ${newValue}`);
            },
        },
    }

// Each state-manager is accessible individually with the entities getter.
console.log(store.entities.firstName.value); // "John"
console.log(store.entities.lastName.value); // "Doe"

// Get the store value
console.log(store.value); // { firstName: "John", lastName: "Doe" }

// Set the store value
store.value = {
    firstName: "Jane",
    lastName: "Smith",
};

// Reset the store to its initial values
store.reset();

// The update method updates the state managers' values using either an update object or an updater function that receives the current values and returns the updated ones.
store.update((currentValues) => ({
    ...currentValues,
    firstName: "Alice",
}));
store.update({
    firstName: "Bob",
    lastName: "Johnson",
});

// Get the initial values of the store
console.log(store.initialValue); // { firstName: "John", lastName: "Doe" }

// The hydrate method takes a value and returns an object that includes an update method and the value itself. This object is used to create the hydrated state of the application.
const hydrate = store.hydrate({
    firstName: "Charlie",
    lastName: "Brown",
});

```

```js
// React version
import { ReactStoreManager } from "state-management-utilities";
const store = new ReactStoreManager({
  firstName: "John",
  lastName: "Doe",
});

const [storeValue, setStoreValue] = store.hooks.useState();
```

```js
// React version with builtin functions
import { store } from "state-management-utilities";
const name = store({
  firstName: "John",
  lastName: "Doe",
});
```

## Task Manager

The React-Task-Manager is essentially the same as task-manager-core package.
However, it includes state-managers for state, error, isProcessing, and requestDetails that update automatically.

```js
import { TaskManager } from "state-management-utilities";
const greet = new TaskManager({
  handler: async (name) => {
    return `Hello, ${name}!`;
  },

  uid: "task-manager-unique-identifier",

  stateConfig: { initialValue: null },
  errorConfig: { initialValue: null },
  isProcessingConfig: { initialValue: false },

  ...
});
```

```js
// React version
import { ReactTaskManager } from "state-management-utilities";
const greet = new ReactTaskManager({
  handler: async (name) => {
    return `Hello, ${name}!`;
  },
});
```

```js
// React version with builtin functions
import { taskManager } from "state-management-utilities";
const greet = taskManager({
  handler: async (name) => {
    return `Hello, ${name}!`;
  },
});
```

## React Form Manager

The Form class provides a way to manage the state of React form components more efficiently.
It is designed to be lightweight, easy to use, and flexible.
It provides a convenient way to manage form component state without writing complex code.
The Form class also manages errors, touched, and modified states, and can validate each field separately.
There are additional advanced features that make it well suited for managing the state of form components in React applications.
There is also a function called form that creates a react-form-Manager instance, eliminating the need to use the new operator.

Its constructor accepts initialValues for the fields as its first parameter.
Its second parameter is a configuration object that may include UID, getValidator, onReset, hasError, meta, data, errors, modified, and touched.
The UID is a unique identifier that is used for monitoring and debugging.
getValidator generates a validator function for each field.
It receives the fieldName as the first parameter and the current form instance (form reference) as the second parameter.
It returns a validator function that receives the field value as its argument.
The onReset callback is executed every time the form is reset.
The hasError callback receives a field's error and returns whether the field has an error.
The meta object stores data that will be available on the form instance wherever it is used.
The data, errors, modified, and touched objects are used to define configuration for each state manager.

```js
import debounce from "lodash.debounce";
import { form } from "state-management-utilities";

const nameForm = form(
  { firstName: "", lastName: "" },
  {
    uid: "name-form",
    getValidator(fieldName, instance) {
      return debounce((value) => {
        instance.errors[fieldName].value = !value?.length;
      }, 750);
    },
    onReset() {
      console.log("Form reset!");
    },
    hasError(error) {
      return Boolean(error);
    },
    meta: {
      description: "This is the name form!",
    },
    data: { firstName: {}, lastName: {} },
    errors: { firstName: {}, lastName: {} },
    modified: { firstName: {}, lastName: {} },
    touched: { firstName: {}, lastName: {} },
  }
);

// Form fields
console.log(`fields: `, nameForm.fields);

// Data, errors, modified, and touched
console.log({
  data: nameForm.data,
  errors: nameForm.errors,
  modified: nameForm.modified,
  touched: nameForm.touched,
});

// Get value
console.log(`form value: `, nameForm.value);

// Set value
nameForm.value = {
  data: {
    firstName: "John",
    lastName: "Doe",
  },
  modified: {
    firstName: true,
    lastName: true,
  },
};

// Update method
nameForm.update({ data: { lastName: "Wilson" }, modified: { lastName: true } });

nameForm.update((prev) => ({
  data: { firstName: "Patrick" },
  modified: { firstName: true },
}));

// Reset method
nameForm.reset();

nameForm.reset({
  data: {
    firstName: "Joe",
    lastName: "Smith",
  },
  modified: {
    firstName: true,
    lastName: true,
  },
});

// Get KEYS
console.log(`form keys: `, nameForm.KEYS);

// Set all as touched
nameForm.setAllAsTouched();

// Set all as untouched
nameForm.setAllAsUntouched();

// Set all as modified
nameForm.setAllAsModified();

// Set all as unmodified
nameForm.setAllAsUnmodified();

// Get modified values
console.log(`form modified values: `, nameForm.getModifiedValues());

nameForm.update({ modified: { firstName: true } });
console.log(`form modified values: `, nameForm.getModifiedValues());

// Has errors
console.log(`has errors: `, nameForm.hasErrors);

// Is modified
console.log(`is modified: `, nameForm.isModified);

// Is touched
console.log(`is touched: `, nameForm.isTouched);

// Meta object
console.log(`meta: `, nameForm.meta);

// Hooks
console.log(`hooks: `, nameForm.hooks);

// Hydrate
console.log(
  `hydrate: `,
  nameForm.hydrate({
    data: { firstName: "John", lastName: "Smith" },
  })
);
```
