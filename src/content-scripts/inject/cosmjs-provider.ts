import { GetKeyMsg, RequestSignMsg } from "../../background/keyring";
import { sendMessage } from "../../common/message/send";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { fromHex, toBase64, toHex } from "@cosmjs/encoding";
import {
  AccountData,
  PrehashType,
  OfflineSigner,
  StdSignature
} from "@cosmjs/launchpad";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Manifest = require("../../manifest.json");

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
        pubkey: fromHex(key.pubKeyHex)
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
    const id = toHex(random);

    const requestSignMsg = new RequestSignMsg(
      this.chainId,
      id,
      address,
      toHex(message),
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
        value: toBase64(fromHex(key.pubKeyHex))
      },
      signature: toBase64(fromHex(result.signatureHex))
    };
  }
}
