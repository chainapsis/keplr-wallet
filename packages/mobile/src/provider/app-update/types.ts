export interface AppUpdate {
  readonly appVersion: string;
  readonly codepush: {
    readonly newVersion?: string;
    readonly newVersionDownloadProgress?: number;
    readonly currentVersion?: string;
  };
  readonly store: {
    readonly newVersionAvailable?: string;
  };
  readonly restartApp: () => void;
}
