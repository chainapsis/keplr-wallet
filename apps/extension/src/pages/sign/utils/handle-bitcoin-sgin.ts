import {
  SignBitcoinMessageInteractionStore,
  SignBitcoinTxInteractionStore,
} from "@keplr-wallet/stores-core";
import {
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  LedgerOptions,
} from "./ledger-types";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { PubKeyBitcoinCompatible, toXOnly } from "@keplr-wallet/crypto";
import { KeplrError } from "@keplr-wallet/router";
import { ModularChainInfo } from "@keplr-wallet/types";
import AppClient, {
  DefaultWalletPolicy,
  WalletPolicy,
  DefaultDescriptorTemplate,
} from "ledger-bitcoin";
import { Network, Psbt } from "bitcoinjs-lib";
import { toOutputScript } from "bitcoinjs-lib/src/address";
import { BIP322 } from "@keplr-wallet/background";

export const BABYLON_SCRIPT_TYPES = {
  SLASHING: "slashing",
  UNBONDING: "unbonding",
  TIMELOCK: "timelock",
};

export const BABYLON_SCRIPT_TYPES_REGEX = {
  [BABYLON_SCRIPT_TYPES.SLASHING]:
    /^([a-f0-9]{64}) OP_CHECKSIGVERIFY ([a-f0-9]{64}) OP_CHECKSIGVERIFY ([a-f0-9]{64}) OP_CHECKSIG/,
  [BABYLON_SCRIPT_TYPES.UNBONDING]:
    /^([a-f0-9]{64}) OP_CHECKSIGVERIFY ([a-f0-9]{64}) OP_CHECKSIG/,
  [BABYLON_SCRIPT_TYPES.TIMELOCK]:
    /^([a-f0-9]{64}) OP_CHECKSIGVERIFY ([a-f0-9]{2,6}) OP_CHECKSEQUENCEVERIFY$/,
};

/**
 * Bitcoin descriptor templates for different script types
 */
export const DESCRIPTOR_TEMPLATES = {
  /**
   * Basic descriptor templates based on BIP purpose
   * - 86: Taproot (tr)
   * - 84: Native SegWit (wpkh)
   * - other: Legacy (pkh)
   */
  DEFAULT: (purpose: number): DefaultDescriptorTemplate => {
    switch (purpose) {
      case 86:
        return "tr(@0/**)";
      case 84:
        return "wpkh(@0/**)";
      default:
        return "pkh(@0/**)";
    }
  },

  /**
   * Babylon Slashing policy descriptor template
   * Script Format: staker_pk OP_CHECKSIGVERIFY finalityprovider_pk OP_CHECKSIGVERIFY, n of m multi-sig
   * Template Format: tr(@0/**,and_v(v:pk(staker_pk), and_v(v:pk(finalityprovider_pk),multi_a(covenant_threshold, covenant_pk1, ..., covenant_pkn))))
   * @param covenantThreshold - Number of required signatures
   * @param numKeys - Number of covenant public keys
   */
  BABYLON_SLASHING: (covenantThreshold: number, numKeys: number) =>
    `tr(@0/**,and_v(v:pk(@1/**),and_v(v:pk(@2/**),multi_a(${covenantThreshold},${Array.from(
      { length: numKeys },
      (_, index) => `@${3 + index}/**`
    ).join(",")}))))`,

  /**
   * Babylon Unbonding policy descriptor template
   * Script Format: staker_pk OP_CHECKSIGVERIFY, n of m multi-sig
   * Template Format: tr(@0/**,and_v(v:pk(staker_pk),multi_a(covenant_threshold, covenant_pk1, ..., covenant_pkn)))
   * @param covenantThreshold - Number of required signatures
   * @param numKeys - Number of covenant public keys
   */
  BABYLON_UNBONDING: (covenantThreshold: number, numKeys: number) =>
    `tr(@0/**,and_v(v:pk(@1/**),multi_a(${covenantThreshold},${Array.from(
      { length: numKeys },
      (_, index) => `@${2 + index}/**`
    ).join(",")})))`,

  /**
   * Babylon Timelock policy descriptor template
   * Script Format: staker_pk OP_CHECKSIGVERIFY, timelock_blocks OP_CHECKSEQUENCEVERIFY
   * Template Format: tr(@0/**,and_v(v:pk(staker_pk),older(timelock_blocks)))
   * @param timelockBlocks - Number of blocks to wait before spending
   */
  BABYLON_TIMELOCK: (timelockBlocks: number) =>
    `tr(@0/**,and_v(v:pk(@1/**),older(${timelockBlocks})))`,
};

export const connectAndSignMessageWithLedger = async (
  interactionData: NonNullable<
    SignBitcoinMessageInteractionStore["waitingData"]
  >,
  modularChainInfo: ModularChainInfo,
  options: LedgerOptions
): Promise<string> => {
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error("Bitcoin not found");
  }

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

  const { purpose, coinType } = modularChainInfo.bitcoin.bip44;

  if (!purpose) {
    throw new Error("BIP44 purpose is not set");
  }

  const { account, change, addressIndex } = appData["bip44Path"] as {
    account: number;
    change: number;
    addressIndex: number;
  };

  const network = interactionData.data.network;

  // 여기서 이미 Bitcoin 또는 Bitcoin Testnet 중 하나의 앱이 열려있어야 한다.
  await checkBitcoinPubKey(
    interactionData.data.pubKey,
    {
      purpose,
      coinType,
      account,
      change,
      addressIndex,
    },
    network,
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

  const btcApp = new AppClient(transport as any);

  const derivationPath = `m/${purpose}'/${coinType}'/${account}'`;

  const fullPath = `${derivationPath}/${change}/${addressIndex}`;

  try {
    const message = interactionData.data.message;
    const signType = interactionData.data.signType;

    if (signType === "bip322-simple") {
      const address = interactionData.data.address;
      const network = interactionData.data.network;
      const masterFp = await btcApp.getMasterFingerprint();
      const scriptPubKey = toOutputScript(address, network);
      const internalPubKey =
        purpose === 86
          ? toXOnly(Buffer.from(interactionData.data.pubKey))
          : undefined;
      const txToSpend = BIP322.buildToSpendTx(message, scriptPubKey);
      const txToSign = BIP322.buildToSignTx(
        txToSpend.getId(),
        scriptPubKey,
        false,
        internalPubKey
      );

      if (purpose === 86) {
        txToSign.updateInput(0, {
          tapBip32Derivation: [
            {
              masterFingerprint: Buffer.from(masterFp, "hex"),
              pubkey: toXOnly(Buffer.from(interactionData.data.pubKey)),
              path: fullPath,
              leafHashes: [],
            },
          ],
        });
      } else {
        txToSign.updateInput(0, {
          bip32Derivation: [
            {
              masterFingerprint: Buffer.from(masterFp, "hex"),
              pubkey: Buffer.from(interactionData.data.pubKey),
              path: fullPath,
            },
          ],
        });
      }

      const xpub = await btcApp.getExtendedPubkey(derivationPath);

      const policy = getDefaultWalletPolicy(
        masterFp,
        purpose,
        derivationPath,
        xpub
      );

      const signatures = await btcApp.signPsbt(
        txToSign.toBase64(),
        policy,
        null
      );

      for (const [index, partialSignature] of signatures) {
        if (purpose === 86) {
          txToSign.updateInput(index, {
            tapKeySig: partialSignature.signature,
          });
        } else {
          txToSign.updateInput(index, {
            partialSig: [
              {
                pubkey: partialSignature.pubkey,
                signature: partialSignature.signature,
              },
            ],
          });
        }
      }

      txToSign.finalizeAllInputs();

      return BIP322.encodeWitness(txToSign);
    }

    return await btcApp.signMessage(Buffer.from(message), fullPath);
  } catch (e) {
    console.log("error", e);
    throw new KeplrError(ErrModuleLedgerSign, 9999, e.message);
  } finally {
    await transport.close();
  }
};

export const connectAndSignPsbtsWithLedger = async (
  interactionData: NonNullable<SignBitcoinTxInteractionStore["waitingData"]>,
  psbtSignData: {
    psbtBase64: string;
    inputsToSign: {
      index: number;
      address: string;
      hdPath?: string;
      tapLeafHashesToSign?: Buffer[];
    }[];
  }[],
  modularChainInfo: ModularChainInfo,
  options: LedgerOptions
): Promise<string[]> => {
  if (!("bitcoin" in modularChainInfo)) {
    throw new Error("Bitcoin not found");
  }

  if (psbtSignData.length === 0) {
    throw new Error("No psbt sign data");
  }

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

  const { purpose, coinType } = modularChainInfo.bitcoin.bip44;

  if (!purpose) {
    throw new Error("BIP44 purpose is not set");
  }

  const { account, change, addressIndex } = appData["bip44Path"] as {
    account: number;
    change: number;
    addressIndex: number;
  };

  const network = interactionData.data.network;

  await checkBitcoinPubKey(
    interactionData.data.pubKey,
    {
      purpose,
      coinType,
      account,
      change,
      addressIndex,
    },
    network,
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

  const btcApp = new AppClient(transport as any);

  const derivationPath = `m/${purpose}'/${coinType}'/${account}'`;

  try {
    const result = [];

    for (const data of psbtSignData) {
      let policy: WalletPolicy | undefined | void;
      let hmac: Buffer | undefined;
      // 먼저 script path spending 여부를 확인
      try {
        policy = await tryParsePsbt(transport, data.psbtBase64, coinType === 1);
        // const masterFp = await btcApp.getMasterFingerprint();
        // const xpub = await btcApp.getExtendedPubkey(derivationPath);
        // tr(@0/**,{multi_a(6,@1,@2,@3,@4,@5,@6,@7,@8,@9)})
        // policy = new WalletPolicy(
        //   "Test",
        //   "tr(@0/**,{sortedmulti_a(1,@0/<2;3>/*,@1/**),or_b(pk(@2/**),s:pk(@3/**))})",
        //   [
        //     `[${derivationPath.replace("m", masterFp)}]${xpub}`,
        //     "tpub6Fc2TRaCWNgfT49nRGG2G78d1dPnjhW66gEXi7oYZML7qEFN8e21b2DLDipTZZnfV6V7ivrMkvh4VbnHY2ChHTS9qM3XVLJiAgcfagYQk6K",
        //     "tpub6GxHB9kRdFfTqYka8tgtX9Gh3Td3A9XS8uakUGVcJ9NGZ1uLrGZrRVr67DjpMNCHprZmVmceFTY4X4wWfksy8nVwPiNvzJ5pjLxzPtpnfEM",
        //     "tpub6GjFUVVYewLj5no5uoNKCWuyWhQ1rKGvV8DgXBG9Uc6DvAKxt2dhrj1EZFrTNB5qxAoBkVW3wF8uCS3q1ri9fueAa6y7heFTcf27Q4gyeh6",
        //   ]
        // );
      } catch (e) {
        console.log("error", e);
      }

      if (policy) {
        console.log("policy", policy, policy.serialize());

        [, hmac] = await btcApp.registerWallet(policy);
      } else {
        const masterFp = await btcApp.getMasterFingerprint();
        const xpub = await btcApp.getExtendedPubkey(derivationPath);

        policy = getDefaultWalletPolicy(
          masterFp,
          purpose,
          derivationPath,
          xpub
        );
      }

      const psbt = Psbt.fromBase64(data.psbtBase64);

      // 외부에서 들어온 요청의 경우 추가적으로 bip32 derivation을 처리해줘야 한다.
      if (!interactionData.isInternal) {
        const masterFp = await btcApp.getMasterFingerprint();

        // bip32 derivation path 추가
        for (const input of data.inputsToSign) {
          if (purpose === 86) {
            psbt.updateInput(input.index, {
              tapBip32Derivation: [
                {
                  masterFingerprint: Buffer.from(masterFp, "hex"),
                  pubkey: toXOnly(Buffer.from(interactionData.data.pubKey)),
                  path:
                    input.hdPath ??
                    `${derivationPath}/${change}/${addressIndex}`,
                  leafHashes: input.tapLeafHashesToSign ?? [],
                },
              ],
            });
          } else {
            psbt.updateInput(input.index, {
              bip32Derivation: [
                {
                  masterFingerprint: Buffer.from(masterFp, "hex"),
                  pubkey: Buffer.from(interactionData.data.pubKey),
                  path:
                    input.hdPath ??
                    `${derivationPath}/${change}/${addressIndex}`,
                },
              ],
            });
          }
        }
      }

      const newPsbtBase64 = psbt.toBase64();

      console.log("newPsbtBase64", newPsbtBase64);

      const signatures = await btcApp.signPsbt(
        newPsbtBase64,
        policy,
        hmac ?? null
      );

      for (const [index, partialSignature] of signatures) {
        if (purpose === 86) {
          psbt.updateInput(index, {
            tapKeySig: partialSignature.signature,
          });
        } else {
          psbt.updateInput(index, {
            partialSig: [
              {
                pubkey: partialSignature.pubkey,
                signature: partialSignature.signature,
              },
            ],
          });
        }
      }

      psbt.finalizeAllInputs();

      result.push(psbt.toHex());
    }

    return result;
  } catch (e) {
    console.log("error", e);
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
  network: Network,
  options: LedgerOptions
): Promise<void> {
  let transport: Transport;

  const { purpose, coinType, account, change, addressIndex } = bip44Path;

  const hdPath = `${purpose}'/${coinType}'/${account}'/${change}/${addressIndex}`;

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
    const btcApp = new AppClient(transport as any);

    const xpub = await btcApp.getExtendedPubkey(hdPath);

    if (
      Buffer.from(
        new PubKeyBitcoinCompatible(Buffer.from(expectedPubKey)).toBytes()
      ).toString("hex") !==
      Buffer.from(
        PubKeyBitcoinCompatible.fromBase58(xpub, hdPath, network).toBytes()
      ).toString("hex")
    ) {
      throw new KeplrError(
        ErrModuleLedgerSign,
        ErrPublicKeyUnmatched,
        "Public key unmatched"
      );
    }
  } catch (e) {
    throw new KeplrError(ErrModuleLedgerSign, ErrFailedGetPublicKey, e.message);
  } finally {
    await transport.close();
  }
}

function getDefaultWalletPolicy(
  masterFingerprint: string,
  purpose: number,
  derivationPath: string,
  xpub: string
): DefaultWalletPolicy {
  return new DefaultWalletPolicy(
    DESCRIPTOR_TEMPLATES.DEFAULT(purpose),
    `[${derivationPath.replace("m", masterFingerprint)}]${xpub}`
  );
}
