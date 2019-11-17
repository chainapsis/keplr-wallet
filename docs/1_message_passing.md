Chrome (and other modern browser) supports the message system to permit the different components of extension to be able to communicate with each other safely.
In extension, content scripts and background script run in a separate javascript environment from rest of the extension.
For security reasons, these javascript environment is unprivileged.
Message passing is a way that these javascript environments communicate with other privileged environment.  
Check out [this page](https://developer.chrome.com/apps/messaging).  

And, we made the upper layer of this message system to provide a more concrete way to communicate and integrate the other browser that we support in future.
Our message system has simmilar process with cosmos-sdk and supports the type checking by typescript.
Source code is in `src/common/message`.

Abstract message class is
```typescript
abstract class Message<R> {
  /**
   * It is needed to infer the type of result from messaging in order to use message with easy and safe type checking.
   * However, typescript doesn't infer the type of result if generic R is not used in structure due to its structural typing system.
   * So, we need to use generic R though there is no need to use generic R in structure.
   * This is just dummy field for generic R, and actually it is never used.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  private resultType: R;

  /**
   * ValidateBasic does a simple validation check that
   * doesn't require access to any other information.
   * You can throw error in this when msg is invalid.
   */
  abstract validateBasic(): void;
  abstract route(): string;
  abstract type(): string;
  /**
   * Ask for approval if message is sent externally.
   */
  approveExternal(sender: chrome.runtime.MessageSender): boolean {
    if (!sender.url) {
      return false;
    }
    const url = new URL(sender.url);
    if (url.origin !== `chrome-extension://${chrome.runtime.id}`) {
      return false;
    }
    return sender.id === chrome.runtime.id;
  }
}
```
You can make your own message by extending this base class.
Message is excuted by this process `deserialize message -> approve external -> validate basic -> handler by routing`.
Deserializing will be described in next part of this document.
Deserialized message will check approving. `approveExternal` message will get sender information by the parameter and you can use it for knowing where this message is sent from.

// TODO
