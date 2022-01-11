export interface Notification {
  create: (params: {
    iconRelativeUrl?: string;
    title: string;
    message: string;
  }) => void;
}
