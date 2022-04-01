import { delay, inject, singleton } from "tsyringe";
import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { PermissionService } from "../permission";
import { Env } from "@keplr-wallet/router";
import {
  UmbralEncryptionResult,
  UmbralKeyFragment,
} from "@fetchai/umbral-types";

@singleton()
export class UmbralService {
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

  async getPublicKey(_env: Env, _chainId: string): Promise<Uint8Array> {
    throw new Error("Not Implemented");
  }

  async getSigningPublicKey(_env: Env, _chainId: string): Promise<Uint8Array> {
    throw new Error("Not Implemented");
  }

  async encrypt(
    _env: Env,
    _chainId: string,
    _plainTextBytes: Uint8Array
  ): Promise<UmbralEncryptionResult> {
    throw new Error("Not Implemented");
  }

  async decrypt(
    _env: Env,
    _chainId: string,
    _cipherTextBytes: Uint8Array
  ): Promise<Uint8Array> {
    throw new Error("Not Implemented");
  }

  async generateKeyFragments(
    _env: Env,
    _chainId: string,
    _receiverPublicKey: Uint8Array,
    _threshold: number,
    _shares: number
  ): Promise<UmbralKeyFragment[]> {
    throw new Error("Not Implemented");
  }

  async decryptReEncrypted(
    _env: Env,
    _chainId: string,
    _senderPublicKey: Uint8Array,
    _capsule: Uint8Array,
    _capsuleFragments: Uint8Array[],
    _cipherTextBytes: Uint8Array
  ): Promise<Uint8Array> {
    throw new Error("Not Implemented");
  }

  async verifyCapsuleFragment(
    _env: Env,
    _capsuleFragment: Uint8Array,
    _capsule: Uint8Array,
    _verifyingPublicKey: Uint8Array,
    _senderPublicKey: Uint8Array,
    _receiverPublicKey: Uint8Array
  ): Promise<boolean> {
    throw new Error("Not Implemented");
  }
}
