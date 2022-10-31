import {
  AptosSignature,
  AptosSignRequest,
} from "@keystonehq/bc-ur-registry-aptos";
import { BaseKeyring, InteractionProvider } from "@keystonehq/aptos-keyring";
import { CryptoMultiAccounts } from "@keystonehq/bc-ur-registry";
import { UR } from "@keplr-wallet/stores";

interface ReadUR {
  (): Promise<UR>;
}

interface PlayUR {
  (ur: UR, options?: any): Promise<null>;
}

export class KeystoneInteractionProvider implements InteractionProvider {
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

  public readCryptoMultiAccounts = async () => {
    const result = await this.readUR();
    return CryptoMultiAccounts.fromCBOR(Buffer.from(result.cbor, "hex"));
  };

  public requestSignature = async (
    aptosSignRequest: AptosSignRequest,
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
    return AptosSignature.fromCBOR(Buffer.from(result.cbor, "hex"));
  };
}

export class KeystoneKeyring extends BaseKeyring {
  static type = BaseKeyring.type;

  static getEmptyKeyring(): KeystoneKeyring {
    return new KeystoneKeyring();
  }

  private interaction: KeystoneInteractionProvider;

  constructor() {
    super();
    this.interaction = new KeystoneInteractionProvider();
  }

  getInteraction = () => {
    return this.interaction;
  };
}

export function useKeystoneKeyring() {
  return KeystoneKeyring.getEmptyKeyring();
}
