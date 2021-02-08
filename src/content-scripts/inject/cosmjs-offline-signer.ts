import {
  Coin,
  encodeSecp256k1Signature,
  serializeSignDoc,
  AccountData,
  AminoSignResponse,
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
import { OfflineSigner } from "@cosmjs/launchpad";
import { OfflineDirectSigner, makeSignBytes } from "@cosmjs/proto-signing";
import { DirectSignResponse } from "@cosmjs/proto-signing/types/signer";

// TODO: Isn't there a way to import the proto definition in the codec?
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { cosmos } from "@cosmjs/proto-signing/build/codec";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Long = require("long");

const Buffer = require("buffer/").Buffer;

export class CosmJSOfflineSigner implements OfflineSigner, OfflineDirectSigner {
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

  async signDirect(
    signerAddress: string,
    signDoc: cosmos.tx.v1beta1.ISignDoc
  ): Promise<DirectSignResponse> {
    const key = await sendMessage(BACKGROUND_PORT, new GetKeyMsg(this.chainId));

    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    // Currently, @cosmjs/stargate has the limitation that can't change the sign doc in the offline signer.
    // Just, do not change the sign doc temporarily.
    if (false) {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const txBody = cosmos.tx.v1beta1.TxBody.decode(signDoc.bodyBytes!);
      const authInfo = cosmos.tx.v1beta1.AuthInfo.decode(
        signDoc.authInfoBytes!
      );

      const requestTxBuilderConfigMsg = new RequestTxBuilderConfigMsg(
        {
          chainId: signDoc.chainId!,
          accountNumber: signDoc.accountNumber!.toString(),
          sequence: authInfo.signerInfos[0].sequence!.toString(),
          gas: authInfo.fee!.gasLimit!.toString(),
          fee: authInfo
            .fee!.amount!.map((coin: Coin) => `${coin.amount} ${coin.denom}`)
            .join(","),
          memo: txBody.memo
        },
        id,
        true
      );
      const txConfig = await sendMessage(
        BACKGROUND_PORT,
        requestTxBuilderConfigMsg
      );

      txBody.memo = txConfig.config.memo;
      authInfo.fee!.gasLimit = Long.fromString(txConfig.config.gas);
      /*let feeAmountCoins: Coin[];
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
      authInfo.fee!.amount = feeAmountCoins;*/
      if (txConfig.config.sequence) {
        authInfo.signerInfos[0]!.sequence = Long.fromString(
          txConfig.config.sequence
        );
      }
      if (txConfig.config.accountNumber) {
        signDoc.accountNumber = Long.fromString(txConfig.config.accountNumber);
      }

      /* eslint-enable @typescript-eslint/no-non-null-assertion */

      signDoc.bodyBytes = cosmos.tx.v1beta1.TxBody.encode(txBody).finish();
      signDoc.authInfoBytes = cosmos.tx.v1beta1.AuthInfo.encode(
        authInfo
      ).finish();
    }

    const signBytes = makeSignBytes(signDoc);

    const requestSignMsg = new RequestSignMsg(
      this.chainId,
      id,
      signerAddress,
      toHex(signBytes),
      true
    );
    const signature = await sendMessage(BACKGROUND_PORT, requestSignMsg);
    return {
      signed: signDoc,
      // Currently, only secp256k1 is supported.
      signature: encodeSecp256k1Signature(
        fromHex(key.pubKeyHex),
        fromHex(signature.signatureHex)
      )
    };
  }

  // Fallback to `sign` to support cosmjs v0.23.0.
  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
    return this.sign(signerAddress, signDoc);
  }

  async sign(
    signerAddress: string,
    signDoc: StdSignDoc
  ): Promise<AminoSignResponse> {
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
