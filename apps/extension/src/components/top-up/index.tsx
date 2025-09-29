import { IFeeConfig } from "@keplr-wallet/hooks";
import React from "react";
import { Subtitle4 } from "../typography";
import { ColorPalette } from "../../styles";

export const FeeCoverageDescription = ({
  feeConfig,
}: {
  feeConfig: IFeeConfig;
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <Subtitle4
        color={ColorPalette["gray-300"]}
        style={{ textAlign: "center" }}
      >
        Not enough {feeConfig.fees[0]?.denom}? Don’t worry! ✨<br />
        We&apos;ll cover{" "}
        <span style={{ color: ColorPalette["blue-500"] }}>
          {feeConfig.fees[0]?.toString()}
        </span>{" "}
        for you :)
      </Subtitle4>
    </div>
  );
};
