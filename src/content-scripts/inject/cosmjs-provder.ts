import { GetKeyMsg, RequestSignMsg } from "../../background/keyring";
import { sendMessage } from "../../common/message/send";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { toBase64 } from "@cosmjs/encoding";

const Buffer = require("buffer/").Buffer;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Manifest = require("../../manifest.json");

export type PrehashType = "sha256" | "sha512" | null;

export type Algo = "secp256k1" | "ed25519" | "sr25519";

export interface AccountData {
  // bech32-encoded
  readonly address: string;
  readonly algo: Algo;
  readonly pubkey: Uint8Array;
}

export interface StdSignature {
  readonly pub_key: PubKey;
  readonly signature: string;
}

export interface PubKey {
  // type is one of the strings defined in pubkeyTypes
  // I don't use a string literal union here as that makes trouble with json test data:
  // https://github.com/CosmWasm/cosmjs/pull/44#pullrequestreview-353280504
  readonly type: string;
  // Value field is base64-encoded in all cases
  // Note: if type is Secp256k1, this must contain a COMPRESSED pubkey - to encode from bcp/keycontrol land, you must compress it first
  readonly value: string;
}

export interface OfflineSigner {
  /**
   * Get AccountData array from wallet. Rejects if not enabled.
   */
  readonly getAccounts: () => Promise<readonly AccountData[]>;

  /**
   * Request signature from whichever key corresponds to provided bech32-encoded address. Rejects if not enabled.
   */
  readonly sign: (
    address: string,
    message: Uint8Array,
    prehashType?: PrehashType
  ) => Promise<StdSignature>;
}

export class InjectedCosmJSWalletProvider implements OfflineSigner {
  public readonly identifier: string = "keplr-extension";
  public readonly version: string = Manifest.version;

  constructor(public readonly chainId: string) {}

  async getAccounts(): Promise<AccountData[]> {
    const msg = new GetKeyMsg(this.chainId, window.location.origin);
    const key = await sendMessage(BACKGROUND_PORT, msg);

    if (
      key.algo !== "secp256k1" &&
      key.algo !== "ed25519" &&
      key.algo !== "sr25519"
    ) {
      throw new Error("Unknown key algo");
    }

    return Promise.resolve([
      {
        algo: key.algo,
        address: key.bech32Address,
        pubkey: new Uint8Array(Buffer.from(key.pubKeyHex, "hex"))
      }
    ]);
  }

  async sign(
    address: string,
    message: Uint8Array,
    prehashType: PrehashType = "sha256"
  ): Promise<StdSignature> {
    if (prehashType !== "sha256") {
      throw new Error("Unsupported prehash type");
    }

    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    const requestSignMsg = new RequestSignMsg(
      this.chainId,
      id,
      address,
      Buffer.from(message).toString("hex"),
      true,
      window.location.origin
    );

    const result = await sendMessage(BACKGROUND_PORT, requestSignMsg);

    const msg = new GetKeyMsg(this.chainId, window.location.origin);
    const key = await sendMessage(BACKGROUND_PORT, msg);

    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      pub_key: {
        type: "tendermint/PubKeySecp256k1",
        value: toBase64(Buffer.from(key.pubKeyHex, "hex"))
      },
      signature: toBase64(Buffer.from(result.signatureHex, "hex"))
    };
  }
}
