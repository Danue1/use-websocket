import EventEmitter from "eventemitter3";
import { createContext, DependencyList, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from "react";

interface WebSocketConfig<Key extends string | symbol = string | symbol> {
  readonly binaryType: BinaryType;
  readonly encode: (key: Key, valueList: readonly Value[]) => string;
  readonly decode: (source: string) => readonly [Key, readonly Value[]];
}

export type Value = any;

export function createWebSocket<Key extends string | symbol = string | symbol>({ binaryType, encode, decode }: WebSocketConfig<Key>) {
  type Context = readonly [Store, Dispatch<SetStateAction<Store>>];

  interface Store {
    readonly websocket: null | WebSocket;
    readonly event: EventEmitter;
  }

  interface Dispatcher {
    readonly initialize: (url: string) => void;
    readonly close: () => void;
    readonly send: (key: Key, ...valueList: readonly Value[]) => void;
  }

  const Context = createContext((null as unknown) as Context);

  interface ProviderProps {
    readonly children: ReactNode;
  }

  const Provider = ({ children }: ProviderProps) => {
    const context = useState(createInitialStore);
    return <Context.Provider value={context}>{children}</Context.Provider>;
  };

  const createInitialStore = (websocket: null | WebSocket = null): Store => {
    const event = new EventEmitter();
    if (websocket) {
      websocket.binaryType = binaryType;
      websocket.onmessage = ({ data }) => event.emit(...decode(data));
      websocket.onclose = () => event.removeAllListeners();
    }
    return { websocket, event };
  };

  const useWebSocketContext = (): Context => useContext(Context);

  type EventListener = (...valueList: readonly Value[]) => void;

  const useWebSocket = (): Dispatcher => {
    const [{ websocket }, setState] = useWebSocketContext();
    const createMemo = (): Dispatcher => {
      const initialize = (url: string): void => {
        websocket?.close();
        setState(createInitialStore(new WebSocket(url)));
      };
      const close = (): void => {
        websocket?.close();
        setState(createInitialStore());
      };
      const send = (key: Key, ...valueList: readonly Value[]): void => websocket?.send(encode(key, valueList));
      return { initialize, close, send };
    };
    return useMemo(createMemo, [websocket]);
  };

  const useWebSocketEventListener = (key: Key, eventListener: EventListener, dependencyList?: DependencyList): void => {
    const event = useWebSocketContext()[0].event;
    useEffect(() => {
      event.addListener(key, eventListener);
      return () => void event.removeListener(key, eventListener);
    }, dependencyList);
  };

  const useWebSocketEventListenerOnce = (key: Key, eventListener: EventListener, dependencyList?: DependencyList): void => {
    const event = useWebSocketContext()[0].event;
    const [isTriggered, setIsTriggered] = useState(false);
    useEffect(() => {
      const listener: EventListener = (...valueList: readonly Value[]): void => {
        if (isTriggered) {
          return;
        }
        setIsTriggered(true);
        eventListener(...valueList);
        cleanup();
      };
      const cleanup = () => event.removeListener(key, listener);
      event.once(key, listener);
      return cleanup;
    }, dependencyList);
  };

  return { Provider, useWebSocket, useWebSocketEventListener, useWebSocketEventListenerOnce };
}
