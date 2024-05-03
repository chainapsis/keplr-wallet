import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styleAuto from "./auto.module.scss";
import { Input } from "../input";
import { IGasConfig, IGasSimulator } from "@keplr-wallet/hooks";
import { Card } from "@components-v2/card";

export const GasAutoContainer: FunctionComponent<{
  gasConfig: IGasConfig;

  gasSimulator: IGasSimulator;
}> = observer(({ gasConfig, gasSimulator }) => {
  return (
    <div className={styleAuto["container"]}>
      <div className={styleAuto["gasAdjustmentContainer"]}>
        <Card
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            height: "72px",
          }}
          subheadingStyle={{ background: "transparent", height: "25px" }}
          heading={"Gas Adjustment"}
          subheading={
            <Input
              style={{ background: "transparent" }}
              className={styleAuto["input"]}
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
          }
        />
        <Card
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            height: "72px",
          }}
          subheadingStyle={{ background: "transparent", height: "25px" }}
          heading={"Estimated"}
          subheading={
            <Input
              style={{ background: "transparent" }}
              className={styleAuto["input"]}
              readOnly={true}
              value={gasSimulator.gasEstimated ?? "-"}
            />
          }
        />
      </div>
      <div>
        <Card
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            height: "72px",
          }}
          subheadingStyle={{ background: "transparent", height: "25px" }}
          heading={"Gas amount"}
          subheading={
            <Input
              style={{ background: "transparent" }}
              className={styleAuto["input"]}
              readOnly={true}
              value={gasConfig.gas}
            />
          }
        />
      </div>
    </div>
  );
});
