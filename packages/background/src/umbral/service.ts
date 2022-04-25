import { delay, inject, singleton } from "tsyringe";
import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { PermissionService } from "../permission";
import { Env } from "@keplr-wallet/router";
import { Hash } from "@keplr-wallet/crypto";
import Umbral from "@nucypher/umbral-pre";
import {
  UmbralEncryptionResult,
  UmbralKeyFragment,
} from "@fetchai/umbral-types";

@singleton()
export class UmbralService {
  private _cachedUmbral: typeof Umbral | null = null;

  constructor(
    // @inject(TYPES.SecretWasmStore)
    // protected readonly kvStore: KVStore,
    @inject(ChainsService)
    protected readonly chainsService: ChainsService,
    @inject(delay(() => KeyRingService))
    protected readonly keyRingService: KeyRingService,
    @inject(delay(() => PermissionService))
    public readonly permissionService: PermissionService
  ) {}

  async getPublicKey(env: Env, chainId: string): Promise<Uint8Array> {
    const sk = await this.getPrivateKey(env, chainId);
    return sk.publicKey().toBytes();
  }

  async getSigningPublicKey(env: Env, chainId: string): Promise<Uint8Array> {
    const sk = await this.getSigningPrivateKey(env, chainId);
    return sk.publicKey().toBytes();
  }

  async encrypt(
    _env: Env,
    pubKey: Uint8Array,
    plainTextBytes: Uint8Array
  ): Promise<UmbralEncryptionResult> {
    const umbral = await this.getUmbral();
    const pk = umbral.PublicKey.fromBytes(pubKey);

    const result = umbral.encrypt(pk, plainTextBytes);

    return {
      cipherText: result.ciphertext,
      capsule: result.capsule.toBytes(),
    };
  }

  async decrypt(
    env: Env,
    chainId: string,
    capsuleBytes: Uint8Array,
    cipherTextBytes: Uint8Array
  ): Promise<Uint8Array> {
    const umbral = await this.getUmbral();
    const sk = await this.getPrivateKey(env, chainId);
    const capsule = umbral.Capsule.fromBytes(capsuleBytes);

    return umbral.decryptOriginal(sk, capsule, cipherTextBytes);
  }

  async generateKeyFragments(
    env: Env,
    chainId: string,
    receiverPublicKey: Uint8Array,
    threshold: number,
    shares: number
  ): Promise<UmbralKeyFragment[]> {
    const umbral = await this.getUmbral();
    const sk = await this.getPrivateKey(env, chainId);
    const receivingPublicKey = umbral.PublicKey.fromBytes(receiverPublicKey);
    const signer = new umbral.Signer(sk);

    const frags = umbral.generateKFrags(
      sk,
      receivingPublicKey,
      signer,
      threshold,
      shares,
      true,
      true
    );

    return frags.map((frag) => ({ data: frag.toBytes() }));
  }

  async decryptReEncrypted(
    env: Env,
    chainId: string,
    senderPublicKey: Uint8Array,
    capsuleBytes: Uint8Array,
    capsuleFragments: Uint8Array[],
    cipherTextBytes: Uint8Array
  ): Promise<Uint8Array> {
    const umbral = await this.getUmbral();
    const sk = await this.getPrivateKey(env, chainId);
    const pubKey = umbral.PublicKey.fromBytes(senderPublicKey);

    const initialCapsule: Umbral.Capsule = umbral.Capsule.fromBytes(
      capsuleBytes
    );
    let capsule: Umbral.CapsuleWithFrags | undefined;
    for (const capsuleFragment of capsuleFragments) {
      if (capsule !== undefined) {
        capsule = capsule.withCFrag(
          umbral.VerifiedCapsuleFrag.fromVerifiedBytes(capsuleFragment)
        );
      } else {
        capsule = initialCapsule.withCFrag(
          umbral.VerifiedCapsuleFrag.fromVerifiedBytes(capsuleFragment)
        );
      }
    }

    if (capsule === undefined) {
      throw new Error("No capsule fragments provided, unable to decrypt");
    }

    return capsule.decryptReencrypted(sk, pubKey, cipherTextBytes);
  }

  async verifyCapsuleFragment(
    capsuleFragment: Uint8Array,
    capsuleBytes: Uint8Array,
    verifyingPublicKey: Uint8Array,
    senderPublicKey: Uint8Array,
    receiverPublicKey: Uint8Array
  ): Promise<boolean> {
    const umbral = await this.getUmbral();
    const verifyPubKey = umbral.PublicKey.fromBytes(verifyingPublicKey);
    const senderPubKey = umbral.PublicKey.fromBytes(senderPublicKey);
    const receiverPubKey = umbral.PublicKey.fromBytes(receiverPublicKey);

    const capsule = umbral.Capsule.fromBytes(capsuleBytes);
    const frag = umbral.CapsuleFrag.fromBytes(capsuleFragment);

    try {
      frag.verify(capsule, verifyPubKey, senderPubKey, receiverPubKey);
    } catch {
      return false;
    }

    return true;
  }

  private async getPrivateKey(
    env: Env,
    chainId: string
  ): Promise<Umbral.SecretKey> {
    const chainInfo = await this.chainsService.getChainInfo(chainId);
    const umbral = await this.getUmbral();

    const seed = Hash.sha256(
      Buffer.from(
        await this.keyRingService.sign(
          env,
          chainInfo.chainId,
          Buffer.from(
            JSON.stringify({
              account_number: 0,
              chain_id: chainInfo.chainId,
              fee: [],
              memo:
                "Create Umbral Secret encryption key. Only approve requests by Keplr.",
              msgs: [],
              sequence: 0,
            })
          )
        )
      )
    );

    return umbral.SecretKey.fromBytes(seed);
  }

  private async getSigningPrivateKey(
    env: Env,
    chainId: string
  ): Promise<Umbral.SecretKey> {
    const chainInfo = await this.chainsService.getChainInfo(chainId);
    const umbral = await this.getUmbral();

    const seed = Hash.sha256(
      Buffer.from(
        await this.keyRingService.sign(
          env,
          chainInfo.chainId,
          Buffer.from(
            JSON.stringify({
              account_number: 0,
              chain_id: chainInfo.chainId,
              fee: [],
              memo:
                "Create Umbral Signing Secret encryption key. Only approve requests by Keplr.",
              msgs: [],
              sequence: 0,
            })
          )
        )
      )
    );

    return umbral.SecretKey.fromBytes(seed);
  }

  protected async getUmbral(): Promise<typeof Umbral> {
    if (this._cachedUmbral !== null) {
      return this._cachedUmbral;
    }

    this._cachedUmbral = await import("@nucypher/umbral-pre");
    return this._cachedUmbral;
  }
}
