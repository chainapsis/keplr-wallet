import {
  CryptoAccount,
  CryptoHDKey,
  ETHSignature,
  EthSignRequest,
} from "@keystonehq/bc-ur-registry-eth";
import { BaseKeyring, InteractionProvider } from "@keystonehq/base-eth-keyring";
import { UR } from "@keplr-wallet/stores";

interface ReadUR {
  (): Promise<UR>;
}

interface PlayUR {
  (ur: UR, options?: any): Promise<null>;
}

export class KeystoneEthInteractionProvider implements InteractionProvider {
  private readUR: ReadUR = async () => {
    throw new Error("KeystoneError#readUR function is not set.");
  };

  private playUR: PlayUR = async () => {
    throw new Error("KeystoneError#playUR function is not set.");
  };

  public onReadUR(readUR: ReadUR) {
    this.readUR = readUR;
  }

  public onPlayUR(playUR: PlayUR) {
    this.playUR = playUR;
  }

  public readCryptoHDKeyOrCryptoAccount = async () => {
    const result = await this.readUR();
    if (result.type === "crypto-hdkey") {
      return CryptoHDKey.fromCBOR(Buffer.from(result.cbor, "hex"));
    } else {
      return CryptoAccount.fromCBOR(Buffer.from(result.cbor, "hex"));
    }
  };

  public requestSignature = async (
    aptosSignRequest: EthSignRequest,
    requestTitle?: string,
    requestDescription?: string
  ) => {
    const ur = aptosSignRequest.toUR();
    await this.playUR(
      {
        type: ur.type,
        cbor: ur.cbor.toString("hex"),
      },
      {
        title: requestTitle,
        description: requestDescription,
      }
    );
    const result = await this.readUR();
    return ETHSignature.fromCBOR(Buffer.from(result.cbor, "hex"));
  };
}

export class KeystoneEthKeyring extends BaseKeyring {
  static type = BaseKeyring.type;

  static getEmptyKeyring(): KeystoneEthKeyring {
    return new KeystoneEthKeyring();
  }

  private interaction: KeystoneEthInteractionProvider;

  constructor() {
    super();
    this.interaction = new KeystoneEthInteractionProvider();
  }

  getInteraction = () => {
    return this.interaction;
  };
}

export function useKeystoneEthKeyring() {
  return KeystoneEthKeyring.getEmptyKeyring();
}
