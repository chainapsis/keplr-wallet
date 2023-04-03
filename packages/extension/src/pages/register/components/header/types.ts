export type Header =
  | {
      mode: "intro";
    }
  | {
      mode: "welcome";
      isUserBack: boolean;
    }
  | {
      mode: "step";
      title: string;
      stepCurrent: number;
      stepTotal: number;
    };

export interface HeaderContext {
  setHeader(header: Header): void;
  header: Header;
}
