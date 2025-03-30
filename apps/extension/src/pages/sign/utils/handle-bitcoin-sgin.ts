import { SignBitcoinMessageInteractionStore } from "@keplr-wallet/stores-core";
import {
  ErrFailedInit,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  LedgerOptions,
} from "./ledger-types";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Btc from "@ledgerhq/hw-app-btc";
import { PubKeyBitcoinCompatible } from "@keplr-wallet/crypto";
import { KeplrError } from "@keplr-wallet/router";
import { encodeLegacySignature } from "@keplr-wallet/background";

export const connectAndSignMessageWithLedger = async (
  interactionData: NonNullable<
    SignBitcoinMessageInteractionStore["waitingData"]
  >,
  purpose: number,
  coinType: number,
  options: LedgerOptions
): Promise<string> => {
  const appData = interactionData.data.keyInsensitive;
  if (!appData) {
    throw new Error("Invalid ledger app data");
  }

  if (typeof appData !== "object") {
    throw new Error("Invalid ledger app data");
  }
  if (!appData["bip44Path"] || typeof appData["bip44Path"] !== "object") {
    throw new Error("Invalid ledger app data");
  }

  const { account, change, addressIndex } = appData["bip44Path"] as {
    account: number;
    change: number;
    addressIndex: number;
  };

  await checkBitcoinPubKey(
    interactionData.data.pubKey,
    {
      purpose,
      coinType,
      account,
      change,
      addressIndex,
    },
    options
  );

  let transport: Transport;
  try {
    transport = options?.useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  // coin type is restricted to 0 for now.
  const hdPath = `${purpose}'/0'/${account}'/${change}/${addressIndex}`;

  try {
    const btcApp = new Btc({ transport });
    const message = interactionData.data.message;
    const signType = interactionData.data.signType;

    if (signType === "bip322-simple") {
      // TODO: implement bip322-simple
      throw new KeplrError(
        ErrModuleLedgerSign,
        9999,
        "BIP322-simple is not supported yet"
      );
    }

    // ecdsa
    const { v, r, s } = await btcApp.signMessage(
      hdPath,
      Buffer.from(message).toString("hex")
    );

    return encodeLegacySignature(
      Buffer.from(r, "hex"),
      Buffer.from(s, "hex"),
      v
    );
  } catch (e) {
    throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
  } finally {
    await transport.close();
  }
};

async function checkBitcoinPubKey(
  expectedPubKey: Uint8Array,
  bip44Path: {
    purpose: number;
    coinType: number;
    account: number;
    change: number;
    addressIndex: number;
  },
  options: LedgerOptions
): Promise<string> {
  let transport: Transport;

  // coin type is restricted to 0 for now.
  const { purpose, account, change, addressIndex } = bip44Path;

  const hdPath = `${purpose}'/0'/${account}'/${change}/${addressIndex}`;

  try {
    transport = options?.useWebHID
      ? await TransportWebHID.create()
      : await TransportWebUSB.create();
  } catch (e) {
    throw new KeplrError(
      ErrModuleLedgerSign,
      ErrFailedInit,
      "Failed to init transport"
    );
  }

  try {
    const btcApp = new Btc({ transport });

    const { publicKey } = await btcApp.getWalletPublicKey(hdPath, {
      format: purpose === 86 ? "bech32m" : purpose === 84 ? "bech32" : "legacy",
    });

    if (
      Buffer.from(
        new PubKeyBitcoinCompatible(Buffer.from(expectedPubKey)).toBytes()
      ).toString("hex") !==
      Buffer.from(
        new PubKeyBitcoinCompatible(Buffer.from(publicKey, "hex")).toBytes()
      ).toString("hex")
    ) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrPublicKeyUnmatched,
        "Public key unmatched"
      );
    } else {
      return publicKey;
    }
  } catch (e) {
    throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
  } finally {
    await transport.close();
  }
}

// export const handleEthereumPreSignByLedger = async (
//   interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>,
//   signingMessage: Uint8Array,
//   options?: LedgerOptions
// ): Promise<Uint8Array | undefined> => {
//   const appData = interactionData.data.keyInsensitive;
//   if (!appData) {
//     throw new Error("Invalid ledger app data");
//   }
//   if (typeof appData !== "object") {
//     throw new Error("Invalid ledger app data");
//   }
//   if (!appData["bip44Path"] || typeof appData["bip44Path"] !== "object") {
//     throw new Error("Invalid ledger app data");
//   }

//   const bip44Path = appData["bip44Path"] as {
//     account: number;
//     change: number;
//     addressIndex: number;
//   };

//   const publicKey = Buffer.from((appData["Ethereum"] as any)["pubKey"], "hex");
//   if (publicKey.length === 0) {
//     throw new Error("Invalid ledger app data");
//   }

//   return connectAndSignEthWithLedger(
//     !!options?.useWebHID,
//     publicKey,
//     bip44Path,
//     signingMessage,
//     interactionData.data.signType
//   );
// };

// export const connectAndSignEthWithLedger = async (
//   useWebHID: boolean,
//   expectedPubKey: Uint8Array,
//   bip44Path: {
//     account: number;
//     change: number;
//     addressIndex: number;
//   },
//   message: Uint8Array,
//   signType: EthSignType
// ): Promise<Uint8Array> => {
//   let transport: Transport;
//   try {
//     transport = useWebHID
//       ? await TransportWebHID.create()
//       : await TransportWebUSB.create();
//   } catch (e) {
//     throw new KeplrError(
//       ErrModuleLedgerSign,
//       ErrFailedInit,
//       "Failed to init transport"
//     );
//   }

//   let ethApp = new Eth(transport);

//   // Ensure that the keplr can connect to ethereum app on ledger.
//   // getAppConfiguration() works even if the ledger is on screen saver mode.
//   // To detect the screen saver mode, we should request the address before using.
//   try {
//     await ethApp.getAddress(`m/44'/60'/'0/0/0`);
//   } catch (e) {
//     // Device is locked
//     if (e?.message.includes("(0x6b0c)")) {
//       throw new KeplrError(
//         ErrModuleLedgerSign,
//         ErrCodeDeviceLocked,
//         "Device is locked"
//       );
//     } else if (
//       // User is in home sceen or other app.
//       e?.message.includes("(0x6511)") ||
//       e?.message.includes("(0x6e00)")
//     ) {
//       // Do nothing
//     } else {
//       await transport.close();

//       throw e;
//     }
//   }

//   transport = await LedgerUtils.tryAppOpen(transport, "Ethereum");
//   ethApp = new Eth(transport);

//   try {
//     let pubKey: PubKeySecp256k1;
//     try {
//       const res = await ethApp.getAddress(
//         `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
//       );

//       pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, "hex"));
//     } catch (e) {
//       throw new KeplrError(
//         ErrModuleLedgerSign,
//         ErrFailedGetPublicKey,
//         e.message || e.toString()
//       );
//     }

//     if (
//       Buffer.from(new PubKeySecp256k1(expectedPubKey).toBytes()).toString(
//         "hex"
//       ) !== Buffer.from(pubKey.toBytes()).toString("hex")
//     ) {
//       throw new KeplrError(
//         ErrModuleLedgerSign,
//         ErrPublicKeyUnmatched,
//         "Public key unmatched"
//       );
//     }

//     if (signType === EthSignType.EIP712) {
//       // Pre validate the eip712 message to separate the error case.
//       await EIP712MessageValidator.validateAsync(
//         JSON.parse(Buffer.from(message).toString())
//       );
//     }

//     try {
//       switch (signType) {
//         case EthSignType.MESSAGE: {
//           return ethSignatureToBytes(
//             await ethApp.signPersonalMessage(
//               `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
//               Buffer.from(message).toString("hex")
//             )
//           );
//         }
//         case EthSignType.TRANSACTION: {
//           const tx = JSON.parse(Buffer.from(message).toString());
//           const isEIP1559 = !!tx.maxFeePerGas || !!tx.maxPriorityFeePerGas;
//           if (isEIP1559) {
//             tx.type = TransactionTypes.eip1559;
//           }
//           const rlpArray = serialize(tx).replace("0x", "");

//           return ethSignatureToBytes(
//             await ethApp.signTransaction(
//               `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
//               rlpArray
//             )
//           );
//         }
//         case EthSignType.EIP712: {
//           const data = await EIP712MessageValidator.validateAsync(
//             JSON.parse(Buffer.from(message).toString())
//           );

//           // Unfortunately, signEIP712Message not works on ledger yet.
//           return ethSignatureToBytes(
//             await ethApp.signEIP712HashedMessage(
//               `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
//               domainHash(data),
//               messageHash(data)
//             )
//           );
//         }
//         default:
//           throw new Error("Invalid sign type");
//       }
//     } catch (e) {
//       if (e?.message.includes("(0x6985)")) {
//         throw new KeplrError(
//           ErrModuleLedgerSign,
//           ErrSignRejected,
//           "User rejected signing"
//         );
//       }

//       throw new KeplrError(
//         ErrModuleLedgerSign,
//         ErrFailedSign,
//         e.message || e.toString()
//       );
//     }
//   } finally {
//     await transport.close();
//   }
// };
