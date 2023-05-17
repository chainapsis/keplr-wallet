import React, { FunctionComponent } from "react";
import { IGasConfig, IGasSimulator } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import { GasAutoContainer } from "./auto";
import { GasInput } from "../gas-input";
import styleContainer from "./container.module.scss";
import { Alert } from "reactstrap";

export const GasContainer: FunctionComponent<{
  label?: string;
  gasConfig: IGasConfig;

  gasSimulator: IGasSimulator & {
    outdatedCosmosSdk?: boolean;
    forceDisabled?: boolean;
    forceDisableReason?: Error | undefined;
  };
}> = observer(({ label, gasConfig, gasSimulator }) => {
  return (
    <div className={styleContainer.container}>
      <div className={styleContainer.autoButtonGroup}>
        <div style={{ flex: 1 }} />
        <div className={styleContainer.label}>Auto</div>
        <label
          key="toggle"
          className="custom-toggle"
          style={{ marginBottom: 0 }}
        >
          <input
            type="checkbox"
            checked={gasSimulator.enabled}
            onChange={() => {
              if (!gasSimulator.forceDisabled) {
                gasSimulator.setEnabled(!gasSimulator.enabled);
              }
            }}
          />
          <span className="custom-toggle-slider rounded-circle" />
        </label>
      </div>
      {gasSimulator.outdatedCosmosSdk ? (
        <Alert color="warning">
          Gas estimation is not supported, because this chain uses outdated
          cosmos-sdk
        </Alert>
      ) : null}
      {gasSimulator.forceDisabled && gasSimulator.forceDisableReason ? (
        <Alert color="warning">{gasSimulator.forceDisableReason.message}</Alert>
      ) : null}
      {gasSimulator.enabled ? (
        <GasAutoContainer gasConfig={gasConfig} gasSimulator={gasSimulator} />
      ) : (
        <GasInput label={label} gasConfig={gasConfig} />
      )}
    </div>
  );
});
