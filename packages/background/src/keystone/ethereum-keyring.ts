import { ETHSignature, EthSignRequest } from "@keystonehq/bc-ur-registry-eth";
import { BaseKeyring, InteractionProvider } from "@keystonehq/base-eth-keyring";
import { CryptoAccount, CryptoHDKey } from "@keystonehq/bc-ur-registry";
import { KeystoneKeyringData, KeystoneUR } from "./cosmos-keyring";

interface ReadUR {
  (): Promise<KeystoneUR>;
}

interface PlayUR {
  (ur: KeystoneUR, options?: any): Promise<void>;
}

export class KeystoneEthereumInteractionProvider
  implements InteractionProvider {
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
    ethSignRequest: EthSignRequest,
    requestTitle?: string,
    requestDescription?: string
  ) => {
    const ur = ethSignRequest.toUR();
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

export class KeystoneEthereumKeyring extends BaseKeyring {
  static type = BaseKeyring.type;

  static getEmptyKeyring(): KeystoneEthereumKeyring {
    return new KeystoneEthereumKeyring();
  }

  private interaction: KeystoneEthereumInteractionProvider;

  constructor() {
    super();
    this.interaction = new KeystoneEthereumInteractionProvider();
  }

  getInteraction = () => {
    return this.interaction;
  };

  syncKeyringData(data: KeystoneKeyringData) {
    this.xfp = data.xfp;
  }
}

interface Props {
  readUR?: ReadUR;
  playUR?: PlayUR;
  keyringData?: KeystoneKeyringData;
}

export function useKeystoneEthereumKeyring({
  readUR,
  playUR,
  keyringData,
}: Props) {
  const keyring = KeystoneEthereumKeyring.getEmptyKeyring();
  if (keyringData) {
    keyring.syncKeyringData(keyringData);
  }
  if (readUR) {
    keyring.getInteraction().onReadUR(readUR);
  }
  if (playUR) {
    keyring.getInteraction().onPlayUR(playUR);
  }
  return keyring;
}
