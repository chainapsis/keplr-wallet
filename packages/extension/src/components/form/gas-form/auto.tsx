import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styleAuto from "./auto.module.scss";
import { Input } from "../input";
import { IGasConfig, IGasSimulator } from "@keplr-wallet/hooks";

const MultiplyIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({ size, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 14 14"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12.657 12.686L1.343 1.373m11.314 0L1.343 12.686 12.657 1.373z"
      />
    </svg>
  );
};

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
        <div className={styleAuto.multiplyIcon}>
          <MultiplyIcon size={16} color="#C6C6CD" />
        </div>
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
