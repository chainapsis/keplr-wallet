import { AsyncKVStore } from "../../common";

export const getLastUsedLedgerDeviceId = async (): Promise<
  string | undefined
> => {
  const kvStore = new AsyncKVStore("__keplr_ledger_nano_x");
  return await kvStore.get<string>("last_device_id");
};

export const setLastUsedLedgerDeviceId = async (
  deviceId: string
): Promise<void> => {
  const kvStore = new AsyncKVStore("__keplr_ledger_nano_x");
  await kvStore.set<string>("last_device_id", deviceId);
};
