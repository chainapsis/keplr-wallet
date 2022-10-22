import { MockKVStore } from "../../src/kv-store/mock";
import { SerializedData as MultisigSerializedData } from "../../src/stores/multisig/serialized-data";
import { RootStore } from "../../src/stores/root";
import { WalletState } from "../../src/stores/wallets";
import { MultisigWallet } from "../../src/stores/wallets/multisig-wallet";
import { SerializedData } from "../../src/stores/wallets/serialized-data";

const kvStore = new MockKVStore("wallets-store");
const multisigKVStore = new MockKVStore("multisig-store");
const singlesigKVStore = new MockKVStore("singlesig-store");

function createWalletsStore() {
  const rootStore = new RootStore({
    defaultChain: "juno-1",
    deviceLanguage: "en",
    enabledLanguages: ["en"],
    defaultLanguage: "en",
    KVStore: MockKVStore,
  });
  return rootStore.walletsStore;
}

beforeEach(() => {
  MockKVStore.reset();
});

test("Empty KVStore", async () => {
  const walletsStore = createWalletsStore();
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
  const walletsStore = createWalletsStore();
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
  const walletsStore = createWalletsStore();
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
  const walletsStore = createWalletsStore();
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toEqual(null);
  expect(walletsStore.state).toEqual(WalletState.INVALID);
  expect(await kvStore.get("wallets")).toEqual(invalidData);
});
