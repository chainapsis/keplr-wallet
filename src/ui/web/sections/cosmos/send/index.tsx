import React, { FunctionComponent } from "react";

import { Input } from "../../../../components/form";

import classames from "classnames";
import style from "./styles.module.scss";
import { Button } from "../../../../components/button";
import useForm from "react-hook-form";
import { observer } from "mobx-react";
import { useStore } from "../../../stores";
import {
  AccAddress,
  useBech32Config
} from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

interface FormData {
  readonly recipient: string;
  readonly amount: string;
  readonly memo: string;
}

export const SendSection: FunctionComponent = observer(() => {
  const { register, handleSubmit, errors } = useForm<FormData>({
    defaultValues: {
      recipient: "",
      amount: "",
      memo: ""
    }
  });

  const { chainStore } = useStore();

  return (
    <div className="columns is-gapless">
      <div className="column is-6-widescreen is-7-tablet">
        <div className={style.sendFormColumn}>
          <div className={classames("card", style.card)}>
            <form
              onSubmit={handleSubmit(data => {
                console.log(data);
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
              <Input
                type="text"
                label="Memo (Optional)"
                name="memo"
                error={errors.memo && errors.memo.message}
                ref={register({ required: false })}
              />
              <Button type="submit" color="primary" size="medium" fullwidth>
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="column is-6-widescreen is-5-tablet">
        <div className={style.assetColumn}>
          <div className={classames("card")}>
            <div className="notification is-warning">
              Primar lorem ipsum dolor sit amet, consectetur adipiscing elit
              lorem ipsum dolor. <strong>Pellentesque risus mi</strong>, tempus
              quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit
              amet fringilla. Nullam gravida purus diam, et dictum{" "}
              <a>felis venenatis</a> efficitur. Sit amet, consectetur adipiscing
              elit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
