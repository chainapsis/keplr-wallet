import React from "react";
import { Button, Input } from "reactstrap";
import style from "../style.module.scss";

interface CoinInputProps {
  amount: any;
  transferToken: any;
  depositAddress: any;
  handleAmountChange: any;
  setAmount: any;
  inputInUsd: any;
  amountError: any;
  tokenBal: any;
}
export const CoinInput: React.FC<CoinInputProps> = ({
  amount,
  transferToken,
  depositAddress,
  handleAmountChange,
  setAmount,
  inputInUsd,
  amountError,
  tokenBal,
}) => {
  return (
    <div>
      <div className={style["coinInputContainer"]}>
        <div>
          <div className={style["amount"]}>Amount</div>
          <Input
            className={style["amountInput"]}
            type="number"
            min="0"
            value={amount ? amount.toString() : ""}
            placeholder={`0 ${transferToken ? transferToken.assetSymbol : ""}`}
            onChange={handleAmountChange}
            disabled={!transferToken || depositAddress}
          />
          <div className={style["amountInUsd"]}>
            {inputInUsd && `(${inputInUsd} USD)`}
          </div>
        </div>

        <div className={style["rightWidgets"]}>
          <img src={require("@assets/svg/wireframe/chevron.svg")} alt="" />
          <Button
            className={style["max"]}
            onClick={(e: any) => {
              e.preventDefault();
              const [numericPart, _denomPart] = tokenBal.split(" ");
              console.log(numericPart);
              setAmount(numericPart);
            }}
          >
            MAX
          </Button>
        </div>
      </div>
      {amountError ? (
        <div className={style["errorText"]}>{amountError}</div>
      ) : null}
    </div>
  );
};
