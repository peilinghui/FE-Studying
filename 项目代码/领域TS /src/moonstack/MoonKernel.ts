import { Component } from 'react';
import MoonStorage from './features/Storage';
import _ from 'lodash';

interface State {
  [key: string]: any
}

interface StateContainer {
  models: {
    state: string;
    component: Component;
  }[],
  value?: any
}

interface StatePlaceholder {
  __connected: boolean;
  key: string;
  options?: StateOptions;
}

interface StateOptions {
  default?: any;
}

type StateFunction = (key: string, options?: StateOptions) => StateContainer | StatePlaceholder;

const MODEL_REPO: {
  [identifier: string]: {
    pointers: {
      current: Component;
      [key: string]: Component;
    };
    events: {
      [key: string]: boolean;
    };
  }
} = {};

const EVENT_REPO: {
  [name: string]: {
    [identifier: string]: {
      callback: (data?: any) => void;
    }
  }
} = {};

const STATE_REPO: {
  [key: string]: StateContainer | StatePlaceholder;
} = {};

const MARKS = new Set<string>();

const resolvePath = (path: string) => {
  const blocks = path.split('/');
  const identifier = blocks[0];
  let pointer;
  let method;

  if (blocks.length > 2) {
    // with pointer
    pointer = blocks[1];
    method = blocks[2];
  } else {
    // without pointer
    method = blocks[1];
  }
  return { identifier, pointer, method };
}

export default class MoonInterface {

  private identifier: string;
  private model: Component;
  private storageInterface: MoonStorage;

  constructor(identifier: string, component: Component) {
    MODEL_REPO[identifier] = {
      pointers: {
        current: component
      },
      events: {}
    };
    this.identifier = identifier;
    this.model = component;
    this.storageInterface = new MoonStorage;
  }

  get storage() {
    return this.storageInterface;
  }

  bind(pointer: string) {
    const currentPointer = MODEL_REPO[this.identifier].pointers.current;
    MODEL_REPO[this.identifier].pointers[pointer] = currentPointer;
  }

  unbind(pointer: string) {
    delete MODEL_REPO[this.identifier].pointers[pointer];
  }

  on(event: string, callback: (...args: any) => void, update?: boolean) {
    if (!EVENT_REPO[event]) {
      EVENT_REPO[event] = {};
    }
    if (EVENT_REPO[event][this.identifier] && !update) {
      return;
    }
    EVENT_REPO[event][this.identifier] = { callback };
    MODEL_REPO[this.identifier].events[event] = true;
  }

  off(event: string) {
    delete EVENT_REPO[event][this.identifier];
  }

  emit(event: string, ...args: any) {
    if (!EVENT_REPO[event]) {
      return;
    }
    for (const identifier of Object.keys(EVENT_REPO[event])) {
      EVENT_REPO[event][identifier].callback(...args);
    }
  }

  ref(identifier: string, pointer?: string): Component | null {
    if (!MODEL_REPO[identifier]) {
      return null;
    }
    if (!pointer) {
      return MODEL_REPO[identifier].pointers.current;
    }
    return MODEL_REPO[identifier].pointers[pointer];
  }

  call(path: string, ...args: any) {
    const { identifier, pointer, method } = resolvePath(path);
    const model = this.ref(identifier, pointer);
    if (!model) {
      return;
    }
    (model as any)[method](...args);
  }

  connect(lambda: (state: StateFunction) => State) {
    const stateMap = lambda((key: string, options?: StateOptions) => STATE_REPO[key] || {
      __connected: true, key, options
    });
    const mixedState: State = {};

    for (const localKey in stateMap) {
      const item = stateMap[localKey];
      const globalState = item as StateContainer;
      if (globalState && globalState.value) {
        mixedState[localKey] = globalState.value;
        globalState.models.push({
          component: this.model,
          state: localKey
        });
      } else if (item && typeof item === 'object' && item.__connected) {
        const placeholder = item as StatePlaceholder;
        STATE_REPO[placeholder.key] = {
          models: [{
            component: this.model,
            state: localKey
          }]
        };
        if (placeholder.options) {
          if (placeholder.options.hasOwnProperty('default')) {
            mixedState[localKey] = placeholder.options.default;
          }
        }
      } else {
        mixedState[localKey] = item;
      }
    }

    if (!this.model.state) {
      this.model.state = mixedState;
    } else {
      this.model.setState(mixedState);
    }
  }

  update(state: State) {
    for (const key in state) {
      const globalState = STATE_REPO[key] as StateContainer;
      if (!globalState) {
        STATE_REPO[key] = {
          models: [],
          value: state[key]
        }
      } else {
        globalState.value = state[key];
        for (const model of globalState.models) {
          const pair: State = {};
          pair[model.state] = state[key];
          model.component.setState(pair);
        }
      }
    }
  }

  async wait(keys: string | string[], callback?: () => void) {
    if (Array.isArray(keys)) {
      while (true) {
        for (const key of keys) {
          if (!_.has(this.model.state, key)) {
            continue;
          }
        }
        break;
      }
    } else {
      while (!_.has(this.model.state, keys)) {}
    }
    if (callback) {
      await callback();
    }
  }

  mark(key: string) {
    MARKS.add(key);
  }

  hasMark(key: string) {
    return MARKS.has(key);
  }

  unmark(key: string) {
    MARKS.delete(key);
  }

  unload() {
    this.model.setState = () => {};
  }

}