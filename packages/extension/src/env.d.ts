declare namespace NodeJS {
  interface ProcessEnv {
    /** node environment */
    NODE_ENV: "production" | "development" | undefined;

    KEPLR_EXT_TX_HISTORY_BASE_URL: string;
  }
}
