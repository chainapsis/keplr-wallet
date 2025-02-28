declare namespace NodeJS {
  interface ProcessEnv {
    /** node environment */
    NODE_ENV: "production" | "development" | undefined;

    KEPLR_EXT_TX_HISTORY_BASE_URL: string;
    KEPLR_EXT_TX_HISTORY_TEST_BASE_URL: string;
    KEPLR_EXT_CONFIG_SERVER: string;
    KEPLR_EXT_EIP6963_PROVIDER_INFO_NAME: string;
    KEPLR_EXT_EIP6963_PROVIDER_INFO_RDNS: string;
    KEPLR_EXT_EIP6963_PROVIDER_INFO_ICON: string;
    KEPLR_EXT_STARKNET_PROVIDER_INFO_ID: string;
    KEPLR_EXT_STARKNET_PROVIDER_INFO_NAME: string;
    KEPLR_EXT_STARKNET_PROVIDER_INFO_ICON: string;
  }
}
