import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  AuthInfo,
  TxBody,
  TxRaw,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import React, { useCallback } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../stores";
import Long from "long";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { PrivKeySecp256k1, PubKeySecp256k1 } from "@keplr-wallet/crypto";

export function KeystoneExamplePage() {
  const { chainStore, accountStore } = useStore();

  const signDirect = useCallback(async () => {
    const chain = "osmosis";
    const info = {
      osmosis: {
        toAddr: "osmo1ptq7fgx0cgghlpjsvarr5kznlkj3h7tmgr0p4d",
      },
    };
    const toAddr = info[chain].toAddr;
    const current = chainStore.current;
    const accountInfo = accountStore.getAccount(current.chainId);
    console.log(current.chainId, accountInfo.bech32Address);
    if (!current.chainId || !accountInfo.bech32Address) {
      console.log("Try again!");
      return;
    }

    const feeCurrency = current.feeCurrencies[0];
    const currency = current.currencies[0];

    const account = await fetch(
      `${current.rest}/cosmos/auth/v1beta1/accounts/${accountInfo.bech32Address}`
    )
      .then((e) => e.json())
      .then((e) => e.account);
    console.log(account);

    const signRes = await window.keplr?.signDirect(
      current.chainId,
      accountInfo.bech32Address,
      {
        bodyBytes: TxBody.encode({
          messages: [
            {
              typeUrl: "/cosmos.bank.v1beta1.MsgSend",
              value: MsgSend.encode({
                fromAddress: accountInfo.bech32Address,
                toAddress: toAddr,
                amount: [
                  {
                    denom: currency.coinDenom,
                    amount: "1",
                  },
                ],
              }).finish(),
            },
          ],
          memo: "ABC",
          timeoutHeight: "0",
          extensionOptions: [],
          nonCriticalExtensionOptions: [],
        }).finish(),
        authInfoBytes: AuthInfo.encode({
          signerInfos: [
            {
              publicKey: {
                typeUrl: "/cosmos.crypto.secp256k1.PubKey",
                value: PubKey.encode({
                  key: (await window.keplr.getKey(current.chainId)).pubKey,
                }).finish(),
              },
              modeInfo: {
                single: {
                  mode: SignMode.SIGN_MODE_DIRECT,
                },
                multi: undefined,
              },
              sequence: account.sequence,
            },
          ],
          fee: {
            amount: [
              {
                denom: feeCurrency.coinDenom,
                amount: "1000",
              },
            ],
            gasLimit: "100000",
            payer: accountInfo.bech32Address,
            granter: "",
          },
        }).finish(),
        chainId: current.chainId,
        accountNumber: Long.fromString(account.account_number),
      }
    );
    if (signRes) {
      const sendRes = await window.keplr?.sendTx(
        current.chainId,
        TxRaw.encode({
          bodyBytes: signRes.signed.bodyBytes,
          authInfoBytes: signRes.signed.authInfoBytes,
          signatures: [Buffer.from(signRes.signature.signature, "hex")],
        }).finish(),
        "block"
      );
      console.log(sendRes);
    }
  }, [accountStore, chainStore]);

  const verify = () => {
    const data = Buffer.from(
      "7b226163636f756e745f6e756d626572223a223735343933222c22636861696e5f6964223a2270756c7361722d32222c22666565223a7b22616d6f756e74223a5b7b22616d6f756e74223a2233383932222c2264656e6f6d223a227573637274227d5d2c22676173223a223135353636227d2c226d656d6f223a22222c226d736773223a5b7b2274797065223a22636f736d6f732d73646b2f4d736753656e64222c2276616c7565223a7b22616d6f756e74223a5b7b22616d6f756e74223a223132303030303030222c2264656e6f6d223a227573637274227d5d2c2266726f6d5f61646472657373223a2273656372657431796d723272706e34396167637436733439756476673668723667783673386d7a6c65306c3463222c22746f5f61646472657373223a2273656372657431726873753336716335746e7a6a67703978723765756d7665687a783666677537347274637275227d7d5d2c2273657175656e6365223a2230227d",
      "hex"
    );

    const priv = new PrivKeySecp256k1(
      Buffer.from(
        "797157ef0e02fda15b73e68e267d349fdf52ea3a248bdcc98883a63a2057f080",
        "hex"
      )
    );

    const signature = priv.sign(data);

    const pub = new PubKeySecp256k1(
      Buffer.from(
        "0217fead3b69ef9460a38635f342d9714c2e183965a5a6f250de20f4f0178db587",
        "hex"
      )
    );

    console.log(
      "verify priv sign",
      pub.verify(data, signature),
      Buffer.from(signature).toString("hex")
    );

    const res = pub.verify(
      data,
      Buffer.from(
        "5754e273543abb72aba940ebb33bf28deab2bd6da1c474afa6a09f9b20e622c16b072380c39cd5c129407a92f616a057f0e1ca7932b144844b2d2b32af8323fb",
        "hex"
      )
    );
    console.log("verify", res);
  };

  verify();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Button onClick={signDirect}>Sign Direct</Button>
      <Button>Sign Eth</Button>
    </div>
  );
}
