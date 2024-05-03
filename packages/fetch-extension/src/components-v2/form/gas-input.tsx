import React, { FunctionComponent, useState } from "react";
import { Input } from "reactstrap";
import { IGasConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { Card } from "../card";
import style from "./gas-input.style.module.scss";
export interface GasInputProps {
  gasConfig: IGasConfig;
  label?: string;
  className?: string;
}

// TODO: Handle the max block gas limit(?)
export const GasInput: FunctionComponent<GasInputProps> = observer(
  ({ gasConfig, label }) => {
    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    return (
      <React.Fragment>
        <Card
          style={{ background: "rgba(255,255,255,0.1)" }}
          heading={label}
          subheading={
            <Input
              id={inputId}
              className={style["input"]}
              type="number"
              step={1}
              min={0}
              value={gasConfig.gasRaw}
              onChange={(e) => {
                gasConfig.setGas(e.target.value);
                e.preventDefault();
              }}
              autoComplete="off"
            />
          }
        />
      </React.Fragment>
    );
  }
);
