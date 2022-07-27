import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styleAuto from "./auto.module.scss";
import { Input } from "../input";
import { IGasConfig, IGasSimulator } from "@keplr-wallet/hooks";

export const GasAutoContainer: FunctionComponent<{
  gasConfig: IGasConfig;

  gasSimulator: IGasSimulator;
}> = observer(({ gasConfig, gasSimulator }) => {
  return (
    <div className={styleAuto.container}>
      <div className={styleAuto.gasAdjustmentContainer}>
        <Input
          label="Gas Adjustment"
          value={
            gasSimulator.gasEstimated != null
              ? gasSimulator.gasAdjustmentRaw
              : "-"
          }
          type={gasSimulator.gasEstimated != null ? "number" : "text"}
          readOnly={gasSimulator.gasEstimated == null}
          step={0.1}
          onChange={(e) => {
            e.preventDefault();

            gasSimulator.setGasAdjustment(e.target.value);
          }}
        />
        <Input
          label="Estimated"
          readOnly={true}
          value={gasSimulator.gasEstimated ?? "-"}
        />
      </div>
      <div>
        <Input label="Gas amount" readOnly={true} value={gasConfig.gas} />
      </div>
    </div>
  );
});
