export interface Confirm {
  confirm: (title: string, paragraph: string) => Promise<boolean>;
}
