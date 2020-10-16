import {
  Coin,
  encodeSecp256k1Signature,
  OfflineSigner,
  serializeSignDoc,
  AccountData,
  SignResponse,
  StdSignDoc
} from "@cosmjs/launchpad";
import { toHex, fromHex } from "@cosmjs/encoding";
import {
  GetKeyMsg,
  RequestSignMsg,
  RequestTxBuilderConfigMsg
} from "../../background/keyring";
import { sendMessage } from "../../common/message/send";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { feeFromString } from "../../background/keyring/utils";

const Buffer = require("buffer/").Buffer;

export class CosmJSOfflineSigner implements OfflineSigner {
  constructor(private readonly chainId: string) {}

  async getAccounts(): Promise<AccountData[]> {
    const key = await sendMessage(BACKGROUND_PORT, new GetKeyMsg(this.chainId));

    return [
      {
        address: key.bech32Address,
        // Currently, only secp256k1 is supported.
        algo: "secp256k1",
        pubkey: fromHex(key.pubKeyHex)
      }
    ];
  }

  async sign(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<SignResponse> {
    const key = await sendMessage(BACKGROUND_PORT, new GetKeyMsg(this.chainId));

    if (key.bech32Address !== signerAddress) {
      throw new Error("Unknown signer address");
    }

    if (this.chainId !== signDoc.chain_id) {
      throw new Error("Unmatched chain id with the offline signer");
    }

    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    const requestTxBuilderConfigMsg = new RequestTxBuilderConfigMsg(
      {
        chainId: signDoc.chain_id,
        accountNumber: signDoc.account_number,
        sequence: signDoc.sequence,
        gas: signDoc.fee.gas,
        fee: signDoc.fee.amount
          .map(coin => `${coin.amount} ${coin.denom}`)
          .join(","),
        memo: signDoc.memo
      },
      id,
      true
    );
    const txConfig = await sendMessage(
      BACKGROUND_PORT,
      requestTxBuilderConfigMsg
    );

    let feeAmountCoins: Coin[];
    const feeAmount = feeFromString(txConfig.config.fee);
    if (Array.isArray(feeAmount)) {
      feeAmountCoins = feeAmount.map(coin => {
        return {
          denom: coin.denom,
          amount: coin.amount.toString()
        };
      });
    } else {
      feeAmountCoins = [
        {
          denom: feeAmount.denom,
          amount: feeAmount.amount.toString()
        }
      ];
    }

    const newSignDoc: StdSignDoc = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      chain_id: signDoc.chain_id,
      // eslint-disable-next-line @typescript-eslint/camelcase
      account_number: txConfig.config.accountNumber ?? signDoc.account_number,
      sequence: txConfig.config.sequence ?? signDoc.sequence,
      fee: {
        gas: txConfig.config.gas,
        amount: feeAmountCoins
      },
      msgs: signDoc.msgs,
      memo: txConfig.config.memo
    };

    const requestSignMsg = new RequestSignMsg(
      signDoc.chain_id,
      id,
      signerAddress,
      toHex(serializeSignDoc(newSignDoc)),
      true
    );
    const signature = await sendMessage(BACKGROUND_PORT, requestSignMsg);

    return {
      signed: newSignDoc,
      // Currently, only secp256k1 is supported.
      signature: encodeSecp256k1Signature(
        fromHex(key.pubKeyHex),
        fromHex(signature.signatureHex)
      )
    };
  }
}
