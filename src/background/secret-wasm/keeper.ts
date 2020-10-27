import { EnigmaUtils } from "secretjs";
import { KeyRingKeeper } from "../keyring/keeper";
import { ChainsKeeper } from "../chains/keeper";
import { Crypto } from "../keyring/crypto";

const Buffer = require("buffer/").Buffer;

export class SecretWasmKeeper {
  constructor(
    private readonly chainsKeeper: ChainsKeeper,
    private readonly keyRingKeeper: KeyRingKeeper
  ) {}

  async encrypt(
    chainId: string,
    contractCodeHash: string,
    msg: object
  ): Promise<Uint8Array> {
    const chainInfo = await this.chainsKeeper.getChainInfo(chainId);

    const keyRingType = await this.keyRingKeeper.getKeyRingType();
    if (keyRingType === "none") {
      throw new Error("Key ring is not initialized");
    }

    // XXX: Keplr should generate the seed deterministically according to the account.
    // Otherwise, it will lost the encryption/decryption key if Keplr is uninstalled or local storage is cleared.
    // For now, use the signature of some string to generate the seed.
    // It need to more research.
    const seed = Crypto.sha256(
      Buffer.from(
        await this.keyRingKeeper.sign(
          chainId,
          Buffer.from(
            JSON.stringify({
              // eslint-disable-next-line @typescript-eslint/camelcase
              account_number: 0,
              // eslint-disable-next-line @typescript-eslint/camelcase
              chain_id: chainId,
              fee: [],
              memo:
                "Create Keplr Secret encryption key. Only approve requests by Keplr.",
              msgs: [],
              sequence: 0
            })
          )
        )
      )
    );

    // TODO: Handle the rest config.
    const utils = new EnigmaUtils(chainInfo.rest, seed);

    return await utils.encrypt(contractCodeHash, msg);
  }

  async decrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    const chainInfo = await this.chainsKeeper.getChainInfo(chainId);

    const keyRingType = await this.keyRingKeeper.getKeyRingType();
    if (keyRingType === "none") {
      throw new Error("Key ring is not initialized");
    }

    // XXX: Keplr should generate the seed deterministically according to the account.
    // Otherwise, it will lost the encryption/decryption key if Keplr is uninstalled or local storage is cleared.
    // For now, use the signature of some string to generate the seed.
    // It need to more research.
    const seed = Crypto.sha256(
      Buffer.from(
        await this.keyRingKeeper.sign(
          chainId,
          Buffer.from(
            JSON.stringify({
              // eslint-disable-next-line @typescript-eslint/camelcase
              account_number: 0,
              // eslint-disable-next-line @typescript-eslint/camelcase
              chain_id: chainId,
              fee: [],
              memo:
                "Create Keplr Secret encryption key. Only approve requests by Keplr.",
              msgs: [],
              sequence: 0
            })
          )
        )
      )
    );

    // TODO: Handle the rest config.
    const utils = new EnigmaUtils(chainInfo.rest, seed);

    return await utils.decrypt(ciphertext, nonce);
  }

  async checkAccessOrigin(
    extensionBaseURL: string,
    chainId: string,
    origin: string
  ) {
    await this.chainsKeeper.checkAccessOrigin(
      extensionBaseURL,
      chainId,
      origin
    );
  }
}
