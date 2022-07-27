import React, { FunctionComponent } from "react";
import { IGasConfig, IGasSimulator } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { GasAutoContainer } from "./auto";
import { GasInput } from "../gas-input";

export const GasContainer: FunctionComponent<{
  label?: string;
  gasConfig: IGasConfig;

  gasSimulator: IGasSimulator;
}> = observer(({ label, gasConfig, gasSimulator }) => {
  return (
    <div
      style={{
        padding: "8px",
        backgroundColor: "white",
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "black",
      }}
    >
      {label ? <div>{label}</div> : null}
      <label key="toggle" className="custom-toggle" style={{ marginBottom: 0 }}>
        <input
          type="checkbox"
          checked={gasSimulator.enabled}
          onChange={() => {
            gasSimulator.setEnabled(!gasSimulator.enabled);
          }}
        />
        <span className="custom-toggle-slider rounded-circle" />
      </label>
      {gasSimulator.enabled ? (
        <GasAutoContainer gasConfig={gasConfig} gasSimulator={gasSimulator} />
      ) : (
        <GasInput gasConfig={gasConfig} />
      )}
    </div>
  );
});
