/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ContextProps } from "@components/notification";
import { deliverMessages } from "@graphQL/messages-api";
import { getKeplrFromWindow } from "@keplr-wallet/stores";
import { TRANSACTION_APPROVED } from "../config.ui.var";
import {
  AuthInfo,
  Fee,
  TxRaw,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";

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

//currently not in use
export const executeTxn = async (
  accountInfo: any,
  notification: ContextProps,
  payload: any,
  messagePayload: any
) => {
  let txnResponse = null;
  switch (payload.method) {
    case "sendToken":
      txnResponse = await sendToken(
        accountInfo,
        notification,
        payload,
        messagePayload
      );
      break;
    case "claimRewards":
      txnResponse = await claimRewards(
        accountInfo,
        notification,
        payload,
        messagePayload
      );
      break;
  }
  return txnResponse;
};

export const claimRewards = async (
  accountInfo: any,
  notification: ContextProps,
  payload: any,
  messagePayload: any
) => {
  const txnResponse = await accountInfo.cosmos.sendWithdrawDelegationRewardMsgs(
    payload.validatorAddresses,
    "",
    {
      gas: "190000",
      amount: [
        {
          denom: "atestfet",
          amount: "950000000000000",
        },
      ],
    },
    { disableBalanceCheck: false },
    {
      onBroadcasted: (txHash: Uint8Array) => {
        notification.push({
          type: "success",
          placement: "top-center",
          duration: 5,
          content: `Transaction broadcasted`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
        deliverMessages(
          messagePayload.accessToken,
          messagePayload.chainId,
          {
            message: TRANSACTION_APPROVED,
            hash: Buffer.from(txHash).toString("hex"),
          },
          accountInfo.bech32Address,
          messagePayload.targetAddress
        );
      },
    }
  );
  return txnResponse;
};

export const sendToken = async (
  accountInfo: any,
  notification: ContextProps,
  payload: any,
  messagePayload: any
) => {
  const txnResponse = await accountInfo.sendToken(
    payload.amount,
    payload.currency,
    payload.recipientAddress,
    "",
    {
      gas: "96000",
      amount: [
        {
          denom: "atestfet",
          amount: "480000000000000",
        },
      ],
    },
    { disableBalanceCheck: false },
    {
      onBroadcasted: (txHash: Uint8Array) => {
        notification.push({
          type: "success",
          placement: "top-center",
          duration: 5,
          content: `Transaction broadcasted`,
          canDelete: true,
          transition: {
            duration: 0.25,
          },
        });
        deliverMessages(
          messagePayload.accessToken,
          messagePayload.chainId,
          {
            message: TRANSACTION_APPROVED,
            hash: Buffer.from(txHash).toString("hex"),
          },
          accountInfo.bech32Address,
          messagePayload.targetAddress
        );
      },
    }
  );
  return txnResponse;
};

//example JSONS
//transferFET
export const data1 = {
  amount: "0.1",
  method: "sendToken",
  currency: {
    coinDenom: "TESTFET",
    coinMinimalDenom: "atestfet",
    coinDecimals: 18,
  },
  reciepientAddress: "asdfd",
};

//sendToken
export const data2 = {
  amount: "0.1",
  method: "sendToken",
  currency: {
    type: "cw20",
    contractAddress: "dsfdfgb",
  },
  reciepientAddress: "asdfd",
};

// claimRewards
export const data3 = {
  method: "claimRewards",
  validatorAddresses: [""],
  memo: "",
};
