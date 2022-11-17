import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  AuthInfo,
  Fee,
  TxBody,
  TxRaw,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import React, { useCallback } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../stores";
import Long from "long";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { Hash, PrivKeySecp256k1, PubKeySecp256k1 } from "@keplr-wallet/crypto";
import {
  AminoSignResponse,
  BroadcastMode,
  EthSignType,
  StdSignature,
} from "@keplr-wallet/types";
import { ExtensionOptionsWeb3Tx } from "@keplr-wallet/proto-types/ethermint/types/v1/web3";
import { EthermintChainIdHelper } from "@keplr-wallet/cosmos";
import { RequestSignAminoMsg } from "@keplr-wallet/background";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

import { JsonRpcProvider } from "@ethersproject/providers";
import { evmosToEth } from "@tharsis/address-converter";

// EIP-1559
async function signAndBroadcastEthereumTx(
  chainId: string,
  signerAddressBech32: string
) {
  const provider = new JsonRpcProvider("https://eth.bd.evmos.dev:8545");

  // Get Keplr signer address in hex
  const signerAddressEth = evmosToEth(signerAddressBech32);
  console.log("signerAddressEth", signerAddressEth);

  // Define Ethereum Tx
  const ethSendTx = {
    chainId: 9000,
    from: signerAddressEth,
    to: "0xee7b8F17E041AE5126A403Ec4cD5FE344b51d7EB",
    maxFeePerGas: `0x${Buffer.from("2000").toString("hex")}`,
    gasLimit: `0x${Buffer.from("21000").toString("hex")}`,
    value: `0x${Buffer.from("100000").toString("hex")}`,
    data: "0x0406080a",
    accessList: [],
    type: 2,
  };

  // Calculate and set nonce
  const nonce = await provider.getTransactionCount(signerAddressEth);
  ethSendTx["nonce"] = nonce;

  // Calculate and set gas fees
  const gasLimit = await provider.estimateGas(ethSendTx);
  const gasFee = await provider.getFeeData();

  ethSendTx["gasLimit"] = gasLimit.toHexString();
  if (!gasFee.maxPriorityFeePerGas || !gasFee.maxFeePerGas) {
    // Handle error
    return;
  }
  ethSendTx["maxPriorityFeePerGas"] = gasFee.maxPriorityFeePerGas.toHexString();
  ethSendTx["maxFeePerGas"] = gasFee.maxFeePerGas.toHexString();

  const rlpEncodedTx = await window.keplr?.signEthereum(
    chainId,
    signerAddressBech32,
    JSON.stringify(ethSendTx),
    "transaction" as EthSignType
  );

  const res = await provider.sendTransaction(rlpEncodedTx);
  console.log("signAndBroadcastEthereumTx", res);

  window.location.hash = "#/keystone/example";

  // Result:
  // {
  //   chainId: 1337,
  //   confirmations: 0,
  //   data: '0x',
  //   from: '0x8577181F3D8A38a532Ef8F3D6Fd9a31baE73b1EA',
  //   gasLimit: { BigNumber: "21000" },
  //   gasPrice: { BigNumber: "1" },
  //   hash: '0x200818a533113c00057ceccd3277249871c4a1ac09514214f03c3b96099b6c92',
  //   nonce: 4,
  //   r: '0x1727bd07080a5d3586422edad86805918e9772adda231d51c32870a1f1cabffb',
  //   s: '0x7afc6be528befb79b9ed250356f6eacd63e853685091e9a3987a3d266c6cb26a',
  //   to: '0x5555763613a12D8F3e73be831DFf8598089d3dCa',
  //   type: null,
  //   v: 2709,
  //   value: { BigNumber: "3141590000000000000" },
  //   wait: [Function]
  // }
}

async function keplrSignEthereum(
  chainId: string,
  signer: string,
  data: string | Uint8Array,
  type: EthSignType
): Promise<AminoSignResponse> {
  let isADR36WithString: boolean;
  [data, isADR36WithString] = window.keplr?.getDataForADR36(data);
  const signDoc = window.keplr?.getADR36SignDoc(signer, data);

  if (data === "") {
    throw new Error("Signing empty data is not supported.");
  }

  const msg = new RequestSignAminoMsg(chainId, signer, signDoc, {
    isADR36WithString,
    ethSignType: type,
  });
  return await window.keplr?.requester.sendMessage(BACKGROUND_PORT, msg);
}

export function KeystoneExamplePage() {
  const { chainStore, accountStore } = useStore();

  const signDirect = useCallback(async () => {
    const toAddr = "osmo1ptq7fgx0cgghlpjsvarr5kznlkj3h7tmgr0p4d";
    const current = chainStore.current;
    const accountInfo = accountStore.getAccount(current.chainId);
    console.log(current.chainId, accountInfo.bech32Address);
    if (!/osmosis/i.test(current.chainName)) {
      alert("Chain is not Osmosis");
      return;
    }
    if (!current.chainId || !accountInfo.bech32Address) {
      setTimeout(signDirect, 100);
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
                    denom: currency.coinMinimalDenom,
                    amount: "10000",
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
      console.log("signRes", signRes);
      try {
        const sendRes = await window.keplr?.sendTx(
          current.chainId,
          TxRaw.encode({
            bodyBytes: signRes.signed.bodyBytes,
            authInfoBytes: signRes.signed.authInfoBytes,
            signatures: [Buffer.from(signRes.signature.signature, "base64")],
          }).finish(),
          "block" as BroadcastMode
        );
        sendRes && console.log("sendRes", Buffer.from(sendRes).toString());
      } catch (err) {
        console.error(err);
      } finally {
        window.location.hash = "#/keystone/example";
      }
    }
  }, [accountStore, chainStore]);

  const signArbitrary = async (data: string | Uint8Array) => {
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    console.log(chainStore.current.chainId, accountInfo.bech32Address);
    if (!chainStore.current.chainId || !accountInfo.bech32Address) {
      console.log("Try again!");
      return;
    }
    try {
      const params: [string, string, string | Uint8Array, StdSignature] = [
        chainStore.current.chainId,
        accountInfo.bech32Address,
        data,
        {} as StdSignature,
      ];
      const signRes = await window.keplr?.signArbitrary(
        params[0],
        params[1],
        params[2]
      );
      console.log("signRes", signRes);
      if (signRes) {
        params[3] = signRes;
        const verifyRes = await window.keplr?.verifyArbitrary(...params);
        console.log("verifyRes", verifyRes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      window.location.hash = "#/keystone/example";
    }
  };
  const signArbitraryString = useCallback(async () => {
    signArbitrary("123");
  }, []);
  const signArbitraryBuffer = useCallback(async () => {
    signArbitrary(Buffer.from("ABC"));
  }, []);

  const sendEthSignTx = async (
    chain: any,
    bech32Address: string,
    signResponse: AminoSignResponse,
    mode: BroadcastMode
  ) => {
    const chainId = chain.chainId;
    const useEthereumSign = true;
    const eip712Signing = true;
    const signedTx = TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: [
            {
              typeUrl: "/cosmos.bank.v1beta1.MsgSend",
              value: MsgSend.encode({
                fromAddress: bech32Address,
                toAddress: "evmos1aeac79lqgxh9zf4yq0kye407x394r4lt4yswj4",
                amount: [
                  {
                    denom: chain.currencies[0].coinMinimalDenom,
                    amount: "1000000",
                  },
                ],
              }).finish(),
            },
          ],
          memo: signResponse.signed.memo,
          extensionOptions: eip712Signing
            ? [
                {
                  typeUrl: "/ethermint.types.v1.ExtensionOptionsWeb3Tx",
                  value: ExtensionOptionsWeb3Tx.encode(
                    ExtensionOptionsWeb3Tx.fromPartial({
                      typedDataChainId: EthermintChainIdHelper.parse(
                        chainId
                      ).ethChainId.toString(),
                      feePayer: bech32Address,
                      feePayerSig: Buffer.from(
                        signResponse.signature.signature,
                        "base64"
                      ),
                    })
                  ).finish(),
                },
              ]
            : undefined,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          {
            publicKey: {
              typeUrl: (() => {
                if (!useEthereumSign) {
                  return "/cosmos.crypto.secp256k1.PubKey";
                }

                if (chainId.startsWith("injective")) {
                  return "/injective.crypto.v1beta1.ethsecp256k1.PubKey";
                }

                return "/ethermint.crypto.v1.ethsecp256k1.PubKey";
              })(),
              value: PubKey.encode({
                key: Buffer.from(
                  signResponse.signature.pub_key.value,
                  "base64"
                ),
              }).finish(),
            },
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
              },
              multi: undefined,
            },
            sequence: signResponse.signed.sequence,
          },
        ],
        fee: Fee.fromPartial({
          amount: [
            {
              denom: chain.feeCurrencies[0].coinMinimalDenom,
              amount: "9223372036854775807",
            },
          ],
          gasLimit: "9223372036854775807",
          payer: eip712Signing
            ? // Fee delegation feature not yet supported. But, for eip712 ethermint signing, we must set fee payer.
              bech32Address
            : undefined,
        }),
      }).finish(),
      signatures: !eip712Signing
        ? [Buffer.from(signResponse.signature.signature, "base64")]
        : [new Uint8Array(0)],
    }).finish();
    return {
      txHash: await window.keplr?.sendTx(
        chainId,
        signedTx,
        mode as BroadcastMode
      ),
      signDoc: signResponse.signed,
    };
  };

  const signEthereum = useCallback(
    async (signType: EthSignType) => {
      const current = chainStore.current;
      const accountInfo = accountStore.getAccount(current.chainId);
      console.log(current.chainId, accountInfo.ethereumHexAddress);
      if (!/evmos/i.test(current.chainName)) {
        alert("Chain is not Evmos");
        return;
      }
      if (!current.chainId || !accountInfo.ethereumHexAddress) {
        setTimeout(() => {
          signEthereum(signType);
        }, 100);
        return;
      }

      signAndBroadcastEthereumTx(current.chainId, accountInfo.bech32Address);
      return;

      let data: any;
      if (signType === EthSignType.TRANSACTION) {
        data = JSON.stringify({
          from: accountInfo.ethereumHexAddress,
          to: "0xee7b8F17E041AE5126A403Ec4cD5FE344b51d7EB",
          gasPrice: `0x${Buffer.from("2000").toString("hex")}`,
          gasLimit: `0x${Buffer.from("21000").toString("hex")}`,
          nonce: `0x${Buffer.from("0").toString("hex")}`,
          value: `0x${Buffer.from("1000000").toString("hex")}`,
        });
      } else if (signType === EthSignType.EIP712) {
        data = JSON.stringify({
          amount: 100,
          token: "0x0000000000000000",
        });
      } else if (signType === EthSignType.MESSAGE) {
        data = "123456";
      }
      console.log("data", data);
      let signRes;
      if (signType === EthSignType.TRANSACTION) {
        signRes = {
          signed: {
            account_number: "0",
            chain_id: "",
            fee: {
              amount: [],
              gas: "0",
            },
            memo: "",
            msgs: [
              {
                type: "sign/MsgSignData",
                value: {
                  data:
                    "eyJmcm9tIjoiMHg5ODU4RWZGRDIzMkI0MDMzRTQ3ZDkwMDAzRDQxRUMzNEVjYUVkYTk0IiwidG8iOiIweGVlN2I4RjE3RTA0MUFFNTEyNkE0MDNFYzRjRDVGRTM0NGI1MWQ3RUIiLCJnYXNQcmljZSI6IjB4MzIzMDMwMzAiLCJnYXNMaW1pdCI6IjB4MzIzMTMwMzAzMCIsIm5vbmNlIjoiMHgzMCIsInZhbHVlIjoiMHgzMTMwMzAzMDMwMzAzMCJ9",
                  signer: "evmos1npvwllfr9dqr8erajqqr6s0vxnk2ak55t3r99j",
                },
              },
            ],
            sequence: "0",
          },
          signature: {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "Ajewu3qCiNOO1JpSS13JjP8+tcqCTJ+dwN/bPZzWAPKZ",
            },
            signature:
              "+G0whDIwMDCFMjEwMDCU7nuPF+BBrlEmpAPsTNX+NEtR1+uHMTAwMDAwMIAloPEjjGO69PrlnTaCvEJ77tD0e2o17uqx/nPWDkjZHiwKoBHrC2ybusEVVqB5H8IXCAHHvmEsst0RodT/IKf0L59N",
          },
        };
      } else if (signType === EthSignType.MESSAGE) {
        signRes = {
          signed: {
            account_number: "0",
            chain_id: "",
            fee: {
              amount: [],
              gas: "0",
            },
            memo: "",
            msgs: [
              {
                type: "sign/MsgSignData",
                value: {
                  data: "MTIzNDU2",
                  signer: "evmos1npvwllfr9dqr8erajqqr6s0vxnk2ak55t3r99j",
                },
              },
            ],
            sequence: "0",
          },
          signature: {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "Ajewu3qCiNOO1JpSS13JjP8+tcqCTJ+dwN/bPZzWAPKZ",
            },
            signature:
              "MHg4YmZkMGYwOWVlYjhhYzI4MzIxOGMwMDJlMWY2MzIwNjEwOTRlN2NmMmU1NzA3MDQ1ZjczYTAxNTgxYmJlYjdhMmMxYzA1MjJjYjRhZmI2MDJkNjQ5YzcyNTMzYzdmYjYyNjBlNWEyYWQ4ZjFkMWY5NmIwOTA3N2Q4YzVmMmI1NDFj",
          },
        };
      }
      if (!signRes) {
        signRes = await keplrSignEthereum(
          current.chainId,
          accountInfo.bech32Address,
          data,
          signType
        );
      }
      if (signRes) {
        console.log("signRes", signRes);
        try {
          const sendRes = await sendEthSignTx(
            current,
            accountInfo.bech32Address,
            signRes,
            "block" as BroadcastMode
          );
          console.log("sendRes", sendRes);
        } catch (err) {
          console.error(err);
        } finally {
          window.location.hash = "#/keystone/example";
        }
      }
    },
    [chainStore, accountStore]
  );

  const signEthereumTransaction = useCallback(async () => {
    signEthereum(EthSignType.TRANSACTION);
  }, [signEthereum]);

  const signEthereumEIP712 = useCallback(async () => {
    signEthereum(EthSignType.EIP712);
  }, [signEthereum]);

  const signEthereumMessage = useCallback(async () => {
    signEthereum(EthSignType.MESSAGE);
  }, [signEthereum]);

  const experimentalSignEIP712CosmosTx_v0 = useCallback(async () => {
    const current = chainStore.current;
    const accountInfo = accountStore.getAccount(current.chainId);
    console.log(current.chainId, accountInfo.ethereumHexAddress);
    if (!current.chainId || !accountInfo.ethereumHexAddress) {
      console.log("Try again!");
      return;
    }
    const account = await fetch(
      `${current.rest}/cosmos/auth/v1beta1/accounts/${accountInfo.bech32Address}`
    )
      .then((e) => e.json())
      .then((e) => e.account);
    console.log(account);
    const signRes = await window.keplr?.experimentalSignEIP712CosmosTx_v0(
      current.chainId,
      accountInfo.bech32Address,
      {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
            { name: "salt", type: "bytes32" },
          ],
          Bid: [
            { name: "amount", type: "uint256" },
            { name: "bidder", type: "Identity" },
          ],
          Identity: [
            { name: "userId", type: "uint256" },
            { name: "wallet", type: "address" },
          ],
        },
        domain: {
          name: "Auction dApp",
          version: "2",
          chainId: 9000,
          verifyingContract: "0x1C56346CD2A2Bf3202F771f50d3D14a367B48070",
          salt:
            "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558",
        },
        primaryType: "Bid",
      },
      {
        chain_id: current.chainId,
        account_number: account.account_number,
        sequence: account.sequence,
        fee: {
          amount: [
            {
              denom: current.feeCurrencies[0].coinDenom,
              amount: "1000",
            },
          ],
          gas: "100000",
          payer: accountInfo.bech32Address,
          granter: "",
        },
        msgs: [
          {
            type: "AAA",
            value: {
              amount: 100,
              bidder: {
                userId: 323,
                wallet: "0x3333333333333333333333333333333333333333",
              },
            },
          },
        ],
        memo: "123",
      }
    );
    console.log("signRes", signRes);
  }, [chainStore, accountStore]);

  const verify = () => {
    const data = Buffer.from(
      "0a8d010a85010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e6412650a2b6f736d6f3139726c34636d32686d7238616679346b6c6470787a33666b61346a6775713061356d37646638122b6f736d6f317074713766677830636767686c706a7376617272356b7a6e6c6b6a336837746d6772307034641a090a044f534d4f12013112034142431294010a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a21024f4e2ad99c34d60b9ba6283c9431a8418af8673212961f97a77b6377fcd05b6212040a020801180212400a0d0a05756f736d6f12043235303010a08d061a2b6f736d6f3139726c34636d32686d7238616679346b6c6470787a33666b61346a6775713061356d376466381a0b6f736d6f2d746573742d3420e8fc10",
      "hex"
    );

    const priv = new PrivKeySecp256k1(
      Buffer.from(
        "797157ef0e02fda15b73e68e267d349fdf52ea3a248bdcc98883a63a2057f080",
        "hex"
      )
    );

    const signature = priv.signDigest32(Hash.sha256(data));

    const pub = new PubKeySecp256k1(
      Buffer.from(
        "024f4e2ad99c34d60b9ba6283c9431a8418af8673212961f97a77b6377fcd05b62",
        "hex"
      )
    );

    console.log(
      "verify priv sign",
      pub.verifyDigest32(Hash.sha256(data), signature),
      Buffer.from(signature).toString("hex")
    );

    const res = pub.verifyDigest32(
      Hash.sha256(data),
      Buffer.from(
        "c3b6cda9269605a54c4626665bddfd1521192c6287d2a12654a662ad141d8c110095b5093e1d4709a930a6ee42948a18a511566c1a472dc855f833733b300818",
        "hex"
      )
    );
    console.log("verify", res);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <p>
        <Button onClick={verify}>Verify Signature</Button>
      </p>
      <p>Chain: Somosis</p>
      <p>
        <Button onClick={signDirect}>Sign Direct</Button>
      </p>
      <p>
        <Button onClick={signArbitraryString}>Sign Arbitrary String</Button>
      </p>
      <p>
        <Button onClick={signArbitraryBuffer}>Sign Arbitrary Buffer</Button>
      </p>
      <p>Chain: Evmos</p>
      <p>
        <Button onClick={signEthereumTransaction}>Sign Eth Transaction</Button>
      </p>
      <p>
        <Button onClick={signEthereumEIP712}>Sign Eth EIP712</Button>
      </p>
      <p>
        <Button onClick={signEthereumMessage}>Sign Eth Message</Button>
      </p>
      <p>
        <Button onClick={experimentalSignEIP712CosmosTx_v0}>
          Sign EIP712CosmosTx_v0
        </Button>
      </p>
    </div>
  );
}
