/*
 This messaging system is influenced by cosmos-sdk.
 The messages are processed in the following order:
 "deserialze message -> validate basic -> handler by routing".
 This deserializing system has weak polymorphism feature.
 Message would be converted to object according to their class and registered type.
 But, nested class is not supported. Message's fields should be primitive types
 and array should not include class.
 */
export abstract class Message {
  abstract validateBasic(): void;
  abstract route(): string;
  abstract type(): string;
  /*
   Ask for approval if message is sent externally.
   */
  approveExternal(sender: chrome.runtime.MessageSender): boolean {
    return sender.id === chrome.runtime.id;
  }
}
