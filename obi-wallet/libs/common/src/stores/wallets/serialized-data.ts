import * as t from "io-ts";

import * as Multisig from "../multisig/serialized-data";

export const SerializedMultisigWalletAnyVersion = t.type({
  type: t.literal("multisig"),
  data: Multisig.SerializedDataAnyVersion,
});

export const SerializedMultisigWallet = t.type({
  type: t.literal("multisig"),
  data: Multisig.SerializedData,
});

export const SerializedSinglesigWalletAnyVersion = t.type({
  type: t.literal("singlesig"),
  data: t.string,
});
export const SerializedSinglesigWallet = SerializedSinglesigWalletAnyVersion;

export const SerializedWalletAnyVersion = t.union([
  SerializedMultisigWalletAnyVersion,
  SerializedSinglesigWalletAnyVersion,
]);
export type SerializedWalletAnyVersion = t.TypeOf<
  typeof SerializedWalletAnyVersion
>;
export const SerializedWallet = t.union([
  SerializedMultisigWallet,
  SerializedSinglesigWallet,
]);
export type SerializedWallet = t.TypeOf<typeof SerializedWallet>;

export const SerializedDataV0 = t.type({
  wallets: t.array(SerializedWalletAnyVersion),
});

export const SerializedData = t.type({
  wallets: t.array(SerializedWallet),
});
export type SerializedData = t.TypeOf<typeof SerializedData>;

export const SerializedDataAnyVersion = SerializedDataV0;
export type SerializedDataAnyVersion = t.TypeOf<
  typeof SerializedDataAnyVersion
>;

export function migrateSerializedData(
  serializedData: SerializedDataAnyVersion
): SerializedData {
  if (SerializedDataV0.is(serializedData)) {
    return {
      wallets: serializedData.wallets.map((wallet) => {
        if (SerializedMultisigWalletAnyVersion.is(wallet)) {
          return {
            type: wallet.type,
            data: Multisig.migrateSerializedData(wallet.data),
          };
        }
        return wallet;
      }),
    };
  }

  return serializedData;
}
