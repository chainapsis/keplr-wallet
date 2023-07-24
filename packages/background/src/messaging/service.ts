import { KeyRingService } from "../keyring";
import { Env } from "@keplr-wallet/router";
import { Hash, PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { decrypt, encrypt, PrivateKey } from "eciesjs";
import { fromBase64, fromHex, toBase64, toHex } from "@cosmjs/encoding";
import { getPubKey, registerPubKey } from "./memorandum-client";
import { MESSAGE_CHANNEL_ID } from "./constants";
import { PrivacySetting, PubKey } from "./types";

export class MessagingService {
  // map of target address vs target public key
  // assumption: chainId incorporated since each network will have a different
  // bech32 prefix
  private _publicKeyCache = new Map<string, PubKey>();
  protected keyRingService!: KeyRingService;

  async init(keyRingService: KeyRingService) {
    this.keyRingService = keyRingService;
  }

  /**
   * Lookup the public key associated with the messaging service
   *
   * @param env The extension environment
   * @param chainId The target chain id
   * @param targetAddress Get the public key for the specified address (if specified), otherwise return senders public key
   * @param accessToken accessToken token to authenticate in memorandum service
   * @returns The base64 encoded compressed public key
   */
  public async getPublicKey(
    env: Env,
    memorandumUrl: string,
    chainId: string,
    targetAddress: string | null,
    accessToken: string
  ): Promise<PubKey> {
    if (targetAddress === null) {
      const sk = await this.getPrivateKey(env, chainId);
      const privateKey = new PrivateKey(Buffer.from(sk));
      return {
        publicKey: toHex(privateKey.publicKey.compressed),
        privacySetting: undefined,
        chatReadReceiptSetting: true,
      };
    } else {
      return await this.lookupPublicKey(
        memorandumUrl,
        accessToken,
        targetAddress,
        chainId
      );
    }
  }

  /**
   * Register public key in memorandum as messaging key
   *
   * @param env The extension environment
   * @param chainId The target chain id
   * @param address Wallet bech32 address
   * @param accessToken accessToken token to authenticate in memorandum service
   * @returns The hex encoded compressed public key
   */
  public async registerPublicKey(
    env: Env,
    memorandumUrl: string,
    chainId: string,
    address: string,
    accessToken: string,
    privacySetting: PrivacySetting,
    chatReadReceiptSetting?: boolean
  ): Promise<PubKey> {
    const sk = await this.getPrivateKey(env, chainId);
    const privateKey = new PrivateKey(Buffer.from(sk));
    const pubKey = toHex(privateKey.publicKey.compressed);

    const regPubKey = await this.lookupPublicKey(
      memorandumUrl,
      accessToken,
      address,
      chainId
    );
    if (
      !regPubKey.privacySetting ||
      !regPubKey.publicKey ||
      !!chatReadReceiptSetting ||
      regPubKey.privacySetting !== privacySetting ||
      regPubKey.chatReadReceiptSetting !== chatReadReceiptSetting
    ) {
      let signature;
      let signed;
      if (!regPubKey.publicKey || regPubKey.publicKey !== pubKey) {
        const encoder = new TextEncoder();

        const encoded = encoder.encode(pubKey);
        const signDoc = {
          chain_id: "",
          account_number: "0",
          sequence: "0",
          fee: {
            gas: "0",
            amount: [],
          },
          msgs: [
            {
              type: "sign/MsgSignData",
              value: {
                signer: address,
                data: toBase64(encoded),
              },
            },
          ],
          memo: "",
        };

        const signData = await this.keyRingService.requestSignAmino(
          env,
          "",
          chainId,
          address,
          signDoc,
          { isADR36WithString: true }
        );

        signature = signData.signature;
        signed = signData.signed;
      }

      await registerPubKey(
        memorandumUrl,
        accessToken,
        pubKey,
        address,
        MESSAGE_CHANNEL_ID,
        privacySetting,
        chainId,
        chatReadReceiptSetting,
        signature ? signature.pub_key.value : undefined,
        signature ? signature.signature : undefined,
        signed
          ? Buffer.from(JSON.stringify(signed)).toString("base64")
          : undefined
      );

      this._publicKeyCache.set(`${address}-${chainId}`, {
        publicKey: pubKey,
        privacySetting,
        chatReadReceiptSetting,
      });
    }

    return {
      publicKey: pubKey,
      privacySetting,
      chatReadReceiptSetting,
    };
  }

  /**
   * Decrypt a message that is targeted at the private key associated with the
   * messaging service
   *
   * @param env The extention environment
   * @param chainId The target chain id
   * @param cipherText The base64 encoded cipher text to be processed
   * @returns The base64 encoded clear text from the message
   */
  async decryptMessage(
    env: Env,
    chainId: string,
    cipherText: string
  ): Promise<string> {
    const sk = await this.getPrivateKey(env, chainId);
    const rawCipherText = Buffer.from(fromBase64(cipherText));

    return toBase64(decrypt(Buffer.from(sk), rawCipherText));
  }

  /**
   * Encrypt a message using the messaging protocol key
   *
   * @param _env The extension environment
   * @param memorandumUrl
   * @param _chainId The target chain id
   * @param targetAddress The target address
   * @param message The base64 encoded message to be processed
   * @param accessToken accessToken token to authenticate in memorandum service
   * @returns The base64 encoded cipher text of the message
   */
  async encryptMessage(
    _env: Env,
    memorandumUrl: string,
    _chainId: string,
    targetAddress: string,
    message: string,
    accessToken: string
  ): Promise<string> {
    const rawMessage = Buffer.from(fromBase64(message));

    const targetPublicKey = await this.lookupPublicKey(
      memorandumUrl,
      accessToken,
      targetAddress,
      _chainId
    );

    if (!targetPublicKey.publicKey)
      throw new Error("Target pub key not registered");
    const rawTargetPublicKey = Buffer.from(fromHex(targetPublicKey.publicKey));

    // encrypt the message
    return toBase64(encrypt(rawTargetPublicKey, rawMessage));
  }

  /**
   * Sign the payload
   *
   * @param env The extension environment
   * @param chainId The target chain id
   * @param payload The base64 encoded payload that should be signed
   * @returns The base64 encoded signature for the payload
   */
  async sign(env: Env, chainId: string, payload: string): Promise<string> {
    const sk = await this.getPrivateKey(env, chainId);
    const privateKey = new PrivKeySecp256k1(sk);

    // decode the payload into raw bytes
    const rawPayload = fromBase64(payload);

    // sign the payload
    const rawSignature = privateKey.sign(rawPayload);

    // convert and return the signature
    return toBase64(rawSignature);
  }

  /**
   * Lookup the public key for a target address
   *
   * Will first check the local cache, if not present will attempt to lookup the
   * information from the memorandum service
   * @param memorandumUrl
   * @param accessToken accessToken token to authenticate in memorandum service
   * @param targetAddress The target address to find the public key for
   * @param chainId
   * @returns The base64 encoded public key for the target address if successful
   * @protected
   */
  protected async lookupPublicKey(
    memorandumUrl: string,
    accessToken: string,
    targetAddress: string,
    chainId: string
  ): Promise<PubKey> {
    // Step 1. Query the cache
    let targetPublicKey = this._publicKeyCache.get(
      `${targetAddress}-${chainId}`
    );

    if (targetPublicKey?.publicKey && targetPublicKey?.privacySetting) {
      return targetPublicKey;
    }

    // Step 2. Cache miss, fetch the public key from the memorandum service and
    //         update the cache
    targetPublicKey = await getPubKey(
      memorandumUrl,
      accessToken,
      targetAddress,
      MESSAGE_CHANNEL_ID,
      chainId
    );
    if (!targetPublicKey) {
      return {
        publicKey: undefined,
        privacySetting: undefined,
        chatReadReceiptSetting: true,
      };
    }

    this._publicKeyCache.set(`${targetAddress}-${chainId}`, targetPublicKey);

    return targetPublicKey;
  }

  /**
   * Builds a private key from the signature of the current keychain
   *
   * @param env The environment of the extension
   * @param chainId The target chain id
   * @returns The generated private key object
   * @private
   */
  private async getPrivateKey(env: Env, chainId: string): Promise<Uint8Array> {
    return Hash.sha256(
      Buffer.from(
        await this.keyRingService.sign(
          env,
          chainId,
          Buffer.from(
            JSON.stringify({
              account_number: 0,
              chain_id: chainId,
              fee: [],
              memo: "Create Messaging Signing Secret encryption key. Only approve requests by Keplr.",
              msgs: [],
              sequence: 0,
            })
          )
        )
      )
    );
  }
}
