import React, { FunctionComponent } from "react";
import { Validator } from "../../../../hooks/use-validator";
import { Input } from "../../../../components/form";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import useForm from "react-hook-form";
import { Button } from "../../../../components/button";
import { useCosmosJS } from "../../../../hooks";
import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import {
  AccAddress,
  useBech32ConfigPromise,
  ValAddress
} from "@everett-protocol/cosmosjs/common/address";
import { MsgDelegate } from "@everett-protocol/cosmosjs/x/staking";
import bigInteger from "big-integer";
import { getCurrency } from "../../../../../chain-info";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { useNotification } from "../../../../components/notification";

interface FormData {
  amount: string;
}

export const StakeModal: FunctionComponent<{ validator: Validator }> = observer(
  ({ validator }) => {
    const { chainStore } = useStore();

    const { register, handleSubmit, errors } = useForm<FormData>({
      defaultValues: {
        amount: ""
      }
    });

    const cosmosJS = useCosmosJS(
      chainStore.chainInfo,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      window.cosmosJSWalletProvider!
    );

    const notification = useNotification();

    const cosmosJSInited = cosmosJS.sendMsgs && cosmosJS.addresses.length > 0;

    return (
      <div>
        <div>{validator.description.moniker}</div>
        <form
          onSubmit={handleSubmit(async data => {
            if (cosmosJSInited) {
              return useBech32ConfigPromise(
                chainStore.chainInfo.bech32Config,
                async () => {
                  const msg = new MsgDelegate(
                    AccAddress.fromBech32(cosmosJS.addresses[0]),
                    ValAddress.fromBech32(validator.operator_address),
                    Coin.parse(data.amount)
                  );

                  if (cosmosJS.sendMsgs) {
                    await cosmosJS.sendMsgs(
                      [msg],
                      {
                        gas: bigInteger(200000),
                        memo: "",
                        fee: new Coin(
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          getCurrency(
                            chainStore.chainInfo.nativeCurrency
                          )!.coinMinimalDenom,
                          new Int("1000")
                        )
                      },
                      () => {
                        notification.push({
                          type: "success",
                          content: "Tx succeeds",
                          duration: 5,
                          canDelete: true,
                          placement: "top-right",
                          transition: {
                            duration: 0.25
                          }
                        });
                      },
                      (e: Error) => {
                        notification.push({
                          type: "danger",
                          content: e.toString(),
                          duration: 5,
                          canDelete: true,
                          placement: "top-right",
                          transition: {
                            duration: 0.25
                          }
                        });
                      },
                      "commit"
                    );
                  }
                }
              );
            }
          })}
        >
          <Input
            type="text"
            label="Amount"
            name="amount"
            error={errors.amount && errors.amount.message}
            ref={register({
              required: "Amount is required",
              validate: value => {
                try {
                  Coin.parse(value);
                } catch (e) {
                  return "Invalid amount";
                }
              }
            })}
          />
          <Button
            type="submit"
            color="primary"
            size="medium"
            fullwidth
            loading={cosmosJS.loading}
            disabled={!cosmosJSInited}
          >
            Send
          </Button>
        </form>
      </div>
    );
  }
);
