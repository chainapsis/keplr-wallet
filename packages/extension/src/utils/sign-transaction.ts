/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import {
  AuthInfo,
  Fee,
  TxRaw,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { getKeplrFromWindow } from "@keplr-wallet/stores";

export const signTransaction = async (
  data: string,
  chainId: string,
  accountInfo: any
) => {
  const payload = JSON.parse(data);

  const keplr = (await getKeplrFromWindow())!;
  const pubKey = (await keplr.getKey(payload.chainId)).pubKey;

  const unsignedTx = TxRaw.fromPartial({
    bodyBytes: payload.bodyBytes,
    authInfoBytes: AuthInfo.encode({
      signerInfos: [
        {
          publicKey: {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: PubKey.encode({
              key: pubKey,
            }).finish(),
          },
          modeInfo: {
            single: {
              mode: SignMode.SIGN_MODE_DIRECT,
            },
            multi: undefined,
          },
          sequence: payload.sequence,
        },
      ],
      fee: Fee.fromPartial({
        amount: [
          {
            denom: "atestfet",
            amount: "480000000000000",
          },
        ],
        gasLimit: payload.gasLimit,
        payer: undefined,
      }),
    }).finish(),
  });
  const signDoc = {
    bodyBytes: unsignedTx.bodyBytes,
    authInfoBytes: unsignedTx.authInfoBytes,
    chainId: payload.chainId,
    accountNumber: payload.accountNumber,
  };
  const signResponse = await keplr.signDirect(
    chainId,
    accountInfo.bech32Address,
    signDoc,
    {
      preferNoSetFee: false,
      preferNoSetMemo: true,
      disableBalanceCheck: true,
    }
  );
  const signedTx = TxRaw.encode({
    bodyBytes: signResponse.signed.bodyBytes,
    authInfoBytes: signResponse.signed.authInfoBytes,
    signatures: [Buffer.from(signResponse.signature.signature, "base64")],
  }).finish();
  return {
    ...signResponse,
    signedTx,
    message: "Transaction Signed",
  };
};
