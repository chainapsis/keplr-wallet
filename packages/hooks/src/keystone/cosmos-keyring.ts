import {
  CosmosSignature,
  CosmosSignRequest,
} from "@keystonehq/bc-ur-registry-cosmos";
import { BaseKeyring, InteractionProvider } from "@keystonehq/cosmos-keyring";
import { CryptoMultiAccounts } from "@keystonehq/bc-ur-registry";
import { UR } from "@keplr-wallet/stores";

interface ReadUR {
  (): Promise<UR>;
}

interface PlayUR {
  (ur: UR, options?: any): Promise<null>;
}

export class KeystoneCosmosInteractionProvider implements InteractionProvider {
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
    aptosSignRequest: CosmosSignRequest,
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
    return CosmosSignature.fromCBOR(Buffer.from(result.cbor, "hex"));
  };
}

export class KeystoneCosmosKeyring extends BaseKeyring {
  static type = BaseKeyring.type;

  static getEmptyKeyring(): KeystoneCosmosKeyring {
    return new KeystoneCosmosKeyring();
  }

  private interaction: KeystoneCosmosInteractionProvider;

  constructor() {
    super();
    this.interaction = new KeystoneCosmosInteractionProvider();
  }

  getInteraction = () => {
    return this.interaction;
  };
}

export function useKeystoneCosmosKeyring() {
  return KeystoneCosmosKeyring.getEmptyKeyring();
}
