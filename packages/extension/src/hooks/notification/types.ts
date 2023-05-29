export interface Notification {
  show(
    mode: "success" | "failed" | "plain",
    title: string,
    paragraph: string
  ): string;
  hide(id: string): void;
}
