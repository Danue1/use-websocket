# use-websocket

```tsx
import { useRef } from "react";
import { createWebSocket } from "use-websocket";

const App = () => (
  <Provider>
    <Chat />
  </Provider>
);

const Chat = () => {
  const ref = useRef;
  const [chattingList, setChattingList] = useState<string[]>([]);
  const { send } = useWebSocket();

  const chat = (): void => {
    const key = "chat";
    const value = "Hello, World!";
    send(key, value);
  };

  useWebSocketEventListener("chat", (message: string) => {
    setChattingList(chattingList => chattingList.concat(message));
  });

  return (
    <div>
      {chattingList.map((chatting, index) => (
        <div key={index}>{chatting}</div>
      ))}
    </div>
  );
};

const { Provider, useWebSocket, useWebSocketEventListener } = createWebSocket({
  binaryType: "arraybuffer",
  encode(key: string, valueList: readonly any[]): string {
    return JSON.stringify({ key, valueList });
  },
  decode(source: string): readonly [string, readonly any[]] {
    const [key, ...valueList] = JSON.parse(source);
    return [key, valueList];
  }
});
```
