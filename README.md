# State Management Utilities

This project provides state management utilities to efficiently and consistently manage state in your applications. The main class provided is `StateManager`, which offers methods to register, un-register, update, and retrieve state.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Creating a State Manager](#creating-a-state-manager)
  - [Registering Callbacks](#registering-callbacks)
  - [Updating State](#updating-state)
  - [Retrieving State](#retrieving-state)
  - [Unregistering Callbacks](#unregistering-callbacks)
  - [Resetting State](#resetting-state)
- [API Reference](#api-reference)
  - [StateManager](#statemanager)
    - [constructor](#constructor)
    - [value](#value)
    - [set](#set)
    - [register](#register)
    - [unregister](#unregister)
    - [reset](#reset)
    - [fullFill](#fullfill)
    - [trigger](#trigger)
    - [hydrated](#hydrated)
    - [uid](#uid)
- License

## Installation

To install the package, use the following command:

```sh
npm install state-management-utilities
```

## Usage

### Creating a State Manager

To create a new state manager, instantiate the `StateManager` class with an initial state:

```typescript
import { StateManager } from "state-management-utilities";

const stateManager = new StateManager("initialState");
```

### Registering Callbacks

You can register callbacks that will be triggered whenever the state is updated:

```typescript
stateManager.register({
  uid: "uniqueCallbackId",
  callback: (newState) => {
    console.log("State updated:", newState);
  },
});
```

### Updating State

To update the state, use the `set` method:

```typescript
stateManager.set((prevState) => prevState + " updated");
```

### Retrieving State

To retrieve the current state, use the `value` getter:

```typescript
console.log(stateManager.value);
```

### Unregistering Callbacks

To unregister a callback, use the `unregister` method:

```typescript
stateManager.unregister({ uid: "uniqueCallbackId" });
```

### Resetting State

To reset the state to its initial value, use the `reset` method:

```typescript
stateManager.reset();
```

## API Reference

### StateManager

#### constructor

Creates a new `StateManager` instance.

```typescript
constructor(initialState: StateType, configs?: TypeStateManagerConfigs<StateType>);
```

- `initialState`: The initial state of the manager.
- `configs`: Optional configurations for the state manager.

#### value

Gets the current state value.

```typescript
public get value(): Readonly<StateType>;
```

Sets a new state value.

```typescript
public set value(newState: StateType);
```

#### set

Updates the current state using the provided updater function.

```typescript
public set(updater: (prev: StateType) => StateType): this;
```

#### register

Registers a new callback in the state manager.

```typescript
public register({
  uid,
  callback,
}: {
  uid: string;
  callback: (newState: StateType) => void | Promise<void>;
}): this;
```

#### unregister

Unregisters a callback from the state manager.

```typescript
public unregister({
  uid,
}: {
  uid: string;
}): this;
```

#### reset

Resets the state manager to its initial state.

```typescript
public reset(): this;
```

#### fullFill

Returns the promise to fulfill the current state change.

```typescript
public async fullFill(): Promise<this>;
```

#### trigger

Triggers the state manager to update the components.

```typescript
public trigger(): this;
```

#### hydrated

Gets the hydrated state value.

```typescript
public get hydrated(): Record<string, any>;
```

#### uid

Gets the unique identifier (uid) from the configuration.

```typescript
public get uid(): string;
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
