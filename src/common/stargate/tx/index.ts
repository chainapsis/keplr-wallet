/**
 * @deprecated
 * @param msg
 */
import { TxBuilderConfig } from "@chainapsis/cosmosjs/core/txBuilder";
import { Context } from "@chainapsis/cosmosjs/core/context";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import bigInteger from "big-integer";
import { cosmos, google } from "../proto";
import { makeAuthInfoBytes, makeSignDoc } from "@cosmjs/proto-signing";

export async function makeProtobufTx(
  context: Context,
  msgs: google.protobuf.Any[],
  config: TxBuilderConfig
): Promise<Uint8Array> {
  const walletProvider = context.get("walletProvider");
  if (walletProvider.getTxBuilderConfig) {
    config = await walletProvider.getTxBuilderConfig(context, config);

    /*
     * If config is delivered from third party wallet, it probably can be produced in another scope.
     * Though type of fee is `Coin` in third party wallet, it can be not the same with `Coin` type in this scope.
     * So, if the fee is likely to be `Coin` type, change the prototype to the `Coin` of the current scope.
     */
    const tempFee = config.fee as any;
    if (Array.isArray(tempFee)) {
      for (let i = 0; i < tempFee.length; i++) {
        if (!(tempFee[i] instanceof Coin)) {
          const fee = tempFee[i];
          const configFee = config.fee as Coin[];
          configFee[i] = new Coin(fee.denom, bigInteger(fee.amount.toString()));
        }
      }
    } else {
      if (!(tempFee instanceof Coin)) {
        config.fee = new Coin(
          tempFee.denom,
          bigInteger(tempFee.amount.toString())
        );
      }
    }

    config.gas = bigInteger(config.gas.toString());
    if (config.sequence) {
      config.sequence = bigInteger(config.sequence.toString());
    }
    if (config.accountNumber) {
      config.accountNumber = bigInteger(config.accountNumber.toString());
    }
  }

  let fee: Coin[] = [];
  if (!Array.isArray(config.fee)) {
    fee = [config.fee];
  } else {
    fee = config.fee;
  }

  const txBodyBytes = cosmos.tx.v1beta1.TxBody.encode({
    messages: msgs,
    memo: config.memo
  }).finish();

  const keys = await walletProvider.getKeys(context);

  let sequence = config.sequence
    ? parseInt(config.sequence.toString())
    : undefined;
  let accountNumber = config.accountNumber
    ? parseInt(config.accountNumber.toString())
    : undefined;

  if (sequence === undefined || accountNumber === undefined) {
    const account = await context.get("queryAccount")(
      context,
      keys[0].bech32Address,
      true
    );
    if (accountNumber === undefined) {
      accountNumber = parseInt(account.getAccountNumber().toString());
    }
    if (sequence === undefined) {
      sequence = parseInt(account.getSequence().toString());
    }
  }

  const authInfoBytes = makeAuthInfoBytes(
    [
      google.protobuf.Any.create({
        // eslint-disable-next-line @typescript-eslint/camelcase
        type_url: "/cosmos.crypto.secp256k1.PubKey",
        value: cosmos.crypto.secp256k1.PubKey.encode({
          key: keys[0].pubKey
        }).finish()
      })
    ],
    fee.map(c => {
      return {
        denom: c.denom,
        amount: c.amount.toString()
      };
    }),
    parseInt(config.gas.toString()),
    sequence
  );

  const signDoc = makeSignDoc(
    txBodyBytes,
    authInfoBytes,
    context.get("chainId"),
    accountNumber
  );

  const signature = await walletProvider.sign(
    context,
    keys[0].bech32Address,
    cosmos.tx.v1beta1.SignDoc.encode(signDoc).finish()
  );

  return cosmos.tx.v1beta1.TxRaw.encode({
    bodyBytes: txBodyBytes,
    authInfoBytes: authInfoBytes,
    signatures: [signature]
  }).finish();
}
