import React, { FunctionComponent } from "react";

import { Input, CoinInput } from "../../../../components/form";

import style from "./styles.module.scss";
import { Button } from "../../../../components/button";
import { Card } from "../../../components/card";
import useForm from "react-hook-form";
import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import {
  AccAddress,
  useBech32Config,
  useBech32ConfigPromise
} from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { MsgSend } from "@everett-protocol/cosmosjs/x/bank";
import bigInteger from "big-integer";
import { Int } from "@everett-protocol/cosmosjs/common/int";
import { useNotification } from "../../../../components/notification";
import { getCurrencies, getCurrency } from "../../../../../common/currency";
import { useCosmosJS } from "../../../../hooks";

interface FormData {
  readonly recipient: string;
  readonly amount: string;
  readonly memo: string;
}

export const SendSection: FunctionComponent = observer(() => {
  const { register, handleSubmit, setValue, setError, errors } = useForm<
    FormData
  >({
    defaultValues: {
      recipient: "",
      amount: "",
      memo: ""
    }
  });

  register(
    { name: "amount" },
    {
      required: "Amount is required"
    }
  );

  const { chainStore } = useStore();

  const cosmosJS = useCosmosJS(
    chainStore.chainInfo,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.cosmosJSWalletProvider!
  );

  const notification = useNotification();

  const clearForm = () => {
    setValue("recipient", "");
    setValue("amount", "");
    setValue("memo", "");
  };

  return (
    <div className="columns is-gapless">
      <div className="column is-6-widescreen is-7-tablet">
        <div className={style.sendFormColumn}>
          <Card>
            <form
              onSubmit={handleSubmit(async data => {
                if (cosmosJS.sendMsgs && cosmosJS.addresses.length > 0) {
                  return useBech32ConfigPromise(
                    chainStore.chainInfo.bech32Config,
                    async () => {
                      const msg = new MsgSend(
                        AccAddress.fromBech32(cosmosJS.addresses[0]),
                        AccAddress.fromBech32(data.recipient),
                        [Coin.parse(data.amount)]
                      );

                      if (cosmosJS.sendMsgs) {
                        await cosmosJS.sendMsgs(
                          [msg],
                          {
                            gas: bigInteger(60000),
                            memo: data.memo,
                            fee: new Coin(
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                              getCurrency(
                                chainStore.chainInfo.nativeCurrency
                              )!.coinMinimalDenom,
                              new Int("1000")
                            )
                          },
                          () => {
                            clearForm();
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
                            clearForm();
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
                label="Recipient"
                name="recipient"
                error={errors.recipient && errors.recipient.message}
                ref={register({
                  required: "Recipient is required",
                  validate: value => {
                    // This is not react hook.
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    return useBech32Config(
                      chainStore.chainInfo.bech32Config,
                      () => {
                        try {
                          AccAddress.fromBech32(value);
                        } catch (e) {
                          return "Invalid address";
                        }
                      }
                    );
                  }
                })}
              />
              <CoinInput
                currencies={getCurrencies(chainStore.chainInfo.currencies)}
                label="Amount"
                error={errors.amount && errors.amount.message}
                setValue={setValue}
                setError={setError}
                name="amount"
              />
              <Input
                type="text"
                label="Memo (Optional)"
                name="memo"
                error={errors.memo && errors.memo.message}
                ref={register({ required: false })}
              />
              <Button
                type="submit"
                color="primary"
                size="medium"
                fullwidth
                loading={cosmosJS.loading}
                disabled={cosmosJS.addresses.length === 0}
              >
                Send
              </Button>
            </form>
          </Card>
        </div>
      </div>
      <div className="column is-6-widescreen is-5-tablet">
        <div className={style.assetColumn}>
          <Card style={{ padding: "0" }}>
            <div className="notification is-warning">
              Primar lorem ipsum dolor sit amet, consectetur adipiscing elit
              lorem ipsum dolor. <strong>Pellentesque risus mi</strong>, tempus
              quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit
              amet fringilla. Nullam gravida purus diam, et dictum{" "}
              <a>felis venenatis</a> efficitur. Sit amet, consectetur adipiscing
              elit
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});
