export interface AppUpdate {
  readonly codepushInitTestCompleted: boolean;
  readonly codepushInitNewVersionExists: boolean;

  readonly appVersion: string;
  readonly codepush: {
    readonly newVersion?: string;
    readonly newVersionDownloadProgress?: number;
    readonly currentVersion?: string;
  };
  readonly store: {
    readonly newVersionAvailable?: boolean;
    readonly updateURL?: string;
  };
  readonly restartApp: () => void;
}
