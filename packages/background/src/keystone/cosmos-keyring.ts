import {
  CosmosSignature,
  CosmosSignRequest,
} from "@keystonehq/bc-ur-registry-cosmos";
import { BaseKeyring, InteractionProvider } from "@keystonehq/cosmos-keyring";
import { CryptoMultiAccounts } from "@keystonehq/bc-ur-registry";
import { BIP44HDPath } from "../keyring";
import { parseHDPath } from "./utils";

export interface KeystoneUR {
  type: string;
  cbor: string;
}

interface ReadUR {
  (): Promise<KeystoneUR>;
}

interface PlayUR {
  (ur: KeystoneUR, options?: any): Promise<void>;
}

export interface KeystonePublicKey {
  coinType: number;
  bip44HDPath: BIP44HDPath;
  pubKey: string;
  index: number;
}

export interface KeystoneKeyringData {
  xfp: string;
  keys: KeystonePublicKey[];
  name?: string;
  device?: string;
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
    cosmosSignRequest: CosmosSignRequest,
    requestTitle?: string,
    requestDescription?: string
  ) => {
    const ur = cosmosSignRequest.toUR();
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

  getKeyringData(): KeystoneKeyringData {
    return {
      xfp: this.xfp,
      device: this.device,
      name: this.name,
      keys: this.getPubKeys().map((e) => {
        const path = parseHDPath(`m/${e.hdPath}`);
        return {
          coinType: path.coinType,
          bip44HDPath: path.bip44HDPath,
          pubKey: e.pubKey,
          index: e.index,
        };
      }),
    };
  }
}

interface Props {
  readUR?: ReadUR;
  playUR?: PlayUR;
  keyringData?: KeystoneKeyringData;
}

export function useKeystoneCosmosKeyring({
  readUR,
  playUR,
  keyringData,
}: Props) {
  const keyring = KeystoneCosmosKeyring.getEmptyKeyring();
  if (keyringData) {
    const data = {
      ...keyringData,
      keys: keyringData.keys.map((e) => ({
        hdPath: `44'/${e.coinType}'/${e.bip44HDPath.account}'/${e.bip44HDPath.change}/${e.bip44HDPath.addressIndex}`,
        index: e.index,
        pubKey: e.pubKey,
      })),
    };
    keyring.syncKeyringData(data);
  }
  if (readUR) {
    keyring.getInteraction().onReadUR(readUR);
  }
  if (playUR) {
    keyring.getInteraction().onPlayUR(playUR);
  }
  return keyring;
}
