export interface Confirm {
  confirm: (
    title: string,
    paragraph: string,
    options?: {
      forceYes?: boolean;
    }
  ) => Promise<boolean>;
}
