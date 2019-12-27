import React, { FunctionComponent } from "react";
import { Validator } from "../../../../hooks/use-validator";
import { CoinInput } from "../../../../components/form";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import useForm from "react-hook-form";
import { Button } from "../../../../components/button";
import { CosmosJsHook } from "../../../../hooks";
import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import {
  AccAddress,
  useBech32ConfigPromise,
  ValAddress
} from "@everett-protocol/cosmosjs/common/address";
import { MsgDelegate } from "@everett-protocol/cosmosjs/x/staking";
import bigInteger from "big-integer";
import { getCurrencies, getCurrency } from "../../../../../common/currency";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { CoinUtils } from "../../../../../common/coin-utils";

interface FormData {
  readonly amount: string;
  readonly denom: string;
}

export const StakeModal: FunctionComponent<{
  validator: Validator;
  cosmosJS: CosmosJsHook;
}> = observer(({ validator, cosmosJS }) => {
  const { chainStore } = useStore();

  const { register, handleSubmit, errors } = useForm<FormData>({
    defaultValues: {
      amount: "",
      denom: ""
    }
  });

  const cosmosJSInited = cosmosJS.sendMsgs && cosmosJS.addresses.length > 0;

  return (
    <div>
      <div>{validator.description.moniker}</div>
      <form
        onSubmit={handleSubmit(async data => {
          if (cosmosJSInited) {
            const coin = CoinUtils.getCoinFromDecimals(data.amount, data.denom);
            return useBech32ConfigPromise(
              chainStore.chainInfo.bech32Config,
              async () => {
                const msg = new MsgDelegate(
                  AccAddress.fromBech32(cosmosJS.addresses[0]),
                  ValAddress.fromBech32(validator.operator_address),
                  coin
                );

                if (cosmosJS.sendMsgs) {
                  await cosmosJS.sendMsgs([msg], {
                    gas: bigInteger(200000),
                    memo: "",
                    fee: new Coin(
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      getCurrency(
                        chainStore.chainInfo.nativeCurrency
                      )!.coinMinimalDenom,
                      new Int("1000")
                    )
                  });
                }
              }
            );
          }
        })}
      >
        <CoinInput
          currencies={getCurrencies([chainStore.chainInfo.nativeCurrency])}
          label="Amount"
          error={
            errors.amount &&
            errors.amount.message &&
            errors.denom &&
            errors.denom.message
          }
          input={{
            name: "amount",
            ref: register({
              required: "Amount is required"
            })
          }}
          select={{
            name: "denom",
            ref: register({
              required: "Denom is required"
            })
          }}
        />
        <Button
          type="submit"
          color="primary"
          size="medium"
          fullwidth
          loading={cosmosJS.loading}
          disabled={!cosmosJSInited}
        >
          Delegate
        </Button>
      </form>
    </div>
  );
});
