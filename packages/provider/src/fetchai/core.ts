import {
  UmbralApi,
  UmbralDecryptMsg,
  UmbralDecryptReEncryptedMsg,
  UmbralEncryptionResult,
  UmbralEncryptMsg,
  UmbralGenerateKeyFragsMsg,
  UmbralGetPublicKeyMsg,
  UmbralGetSigningPublicKeyMsg,
  UmbralKeyFragment,
  UmbralVerifyCapsuleFragMsg,
} from "@fetchai/umbral-types";
import { BACKGROUND_PORT, MessageRequester } from "@keplr-wallet/router";
import { FetchBrowserWallet } from "@fetchai/wallet-types";
import { Keplr } from "@keplr-wallet/types";

class ExtensionCoreUmbral implements UmbralApi {
  constructor(protected readonly requester: MessageRequester) {}

  async getPublicKey(chainId: string): Promise<Uint8Array> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new UmbralGetPublicKeyMsg(chainId)
    );
  }

  async getSigningPublicKey(chainId: string): Promise<Uint8Array> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new UmbralGetSigningPublicKeyMsg(chainId)
    );
  }

  async encrypt(
    pubKey: Uint8Array,
    plainTextBytes: Uint8Array
  ): Promise<UmbralEncryptionResult> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new UmbralEncryptMsg(pubKey, plainTextBytes)
    );
  }

  async generateKeyFragments(
    chainId: string,
    receiverPublicKey: Uint8Array,
    threshold: number,
    shares: number
  ): Promise<UmbralKeyFragment[]> {
    const result = await this.requester.sendMessage(
      BACKGROUND_PORT,
      new UmbralGenerateKeyFragsMsg(
        chainId,
        receiverPublicKey,
        threshold,
        shares
      )
    );
    return result.fragments;
  }

  async decrypt(
    chainId: string,
    capsuleBytes: Uint8Array,
    cipherTextBytes: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new UmbralDecryptMsg(chainId, capsuleBytes, cipherTextBytes)
    );
  }

  async decryptReEncrypted(
    chainId: string,
    senderPublicKey: Uint8Array,
    capsule: Uint8Array,
    capsuleFragments: Uint8Array[],
    cipherTextBytes: Uint8Array
  ): Promise<Uint8Array> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new UmbralDecryptReEncryptedMsg(
        chainId,
        senderPublicKey,
        capsule,
        capsuleFragments,
        cipherTextBytes
      )
    );
  }

  async verifyCapsuleFragment(
    capsuleFragment: Uint8Array,
    capsule: Uint8Array,
    verifyingPublicKey: Uint8Array,
    senderPublicKey: Uint8Array,
    receiverPublicKey: Uint8Array
  ): Promise<boolean> {
    return await this.requester.sendMessage(
      BACKGROUND_PORT,
      new UmbralVerifyCapsuleFragMsg(
        capsuleFragment,
        capsule,
        verifyingPublicKey,
        senderPublicKey,
        receiverPublicKey
      )
    );
  }
}

export class ExtensionCoreFetchWallet implements FetchBrowserWallet {
  readonly keplr: Keplr;
  readonly umbral: UmbralApi;
  readonly version: string;

  constructor(keplr: Keplr, version: string, requester: MessageRequester) {
    this.keplr = keplr;
    this.version = version;
    this.umbral = new ExtensionCoreUmbral(requester);
  }
}
