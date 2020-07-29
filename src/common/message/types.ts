export type MessageSender = Pick<browser.runtime.MessageSender, "id" | "url">;

export interface Env {
  readonly extensionId: string;
  readonly extensionBaseURL: string;
}
