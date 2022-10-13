import { KVStore } from "@keplr-wallet/common";

import { WalletsStore, WalletState } from ".";
import { MockKVStore } from "../../kv-store/mock";
import { ChainStore } from "../chain";
import { SerializedData as MultisigSerializedData } from "../multisig/serialized-data";
import { MultisigWallet } from "./multisig-wallet";
import { SerializedData } from "./serialized-data";

let chainStore: ChainStore;
let kvStore: KVStore;
let multisigKVStore: KVStore;
let singlesigKVStore: KVStore;
let walletsStoreParams: ConstructorParameters<typeof WalletsStore>[0];

beforeEach(() => {
  chainStore = new ChainStore({ defaultChain: "uni-3" });
  MockKVStore.reset();
  kvStore = new MockKVStore("wallets-store");
  multisigKVStore = new MockKVStore("multisig-store");
  singlesigKVStore = new MockKVStore("singlesig-store");
  walletsStoreParams = {
    chainStore,
    kvStore,
    legacyKVStores: {
      multisig: multisigKVStore,
      singlesig: singlesigKVStore,
    },
  };
});

test("Empty KVStore", async () => {
  const walletsStore = new WalletsStore(walletsStoreParams);
  expect(walletsStore.state).toEqual(WalletState.LOADING);
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toEqual(null);
  expect(walletsStore.state).toEqual(WalletState.READY);
  expect(await kvStore.get("wallets")).toEqual({
    currentWalletIndex: null,
    wallets: [],
  });
});

test("KVStore with no wallets", async () => {
  await kvStore.set<SerializedData>("wallets", {
    currentWalletIndex: null,
    wallets: [],
  });
  const walletsStore = new WalletsStore(walletsStoreParams);
  expect(walletsStore.state).toEqual(WalletState.LOADING);
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toEqual(null);
  expect(walletsStore.state).toEqual(WalletState.READY);
});

test("Legacy KVStores", async () => {
  const multisigSerializedData = {
    nextAdmin: {
      biometrics: null,
      phoneNumber: null,
      cloud: null,
      social: null,
    },
    currentAdmin: null,
    proxyAddresses: {},
  };
  const singlesigSerializedData = "mnemonic";
  await multisigKVStore.set<MultisigSerializedData>(
    "multisig",
    multisigSerializedData
  );
  await singlesigKVStore.set<string>("singlesig", singlesigSerializedData);
  const walletsStore = new WalletsStore(walletsStoreParams);
  expect(walletsStore.state).toEqual(WalletState.LOADING);
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toBeInstanceOf(MultisigWallet);
  expect(walletsStore.state).toEqual(WalletState.READY);
  expect(await multisigKVStore.get("multisig")).toBeUndefined();
  expect(await singlesigKVStore.get("singlesig")).toBeUndefined();
  expect(await kvStore.get("wallets")).toEqual({
    currentWalletIndex: 0,
    wallets: [
      {
        type: "multisig",
        data: multisigSerializedData,
      },
      {
        type: "singlesig",
        data: singlesigSerializedData,
      },
    ],
  });
});

test("Fail on invalid data", async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  jest.spyOn(console, "error").mockImplementation(() => {});
  const invalidData = { invalid: [] };
  await kvStore.set("wallets", invalidData);
  const walletsStore = new WalletsStore(walletsStoreParams);
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toEqual(null);
  expect(walletsStore.state).toEqual(WalletState.INVALID);
  expect(await kvStore.get("wallets")).toEqual(invalidData);
});
