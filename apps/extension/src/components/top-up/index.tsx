import { IFeeConfig } from "@keplr-wallet/hooks";
import React from "react";
import { Subtitle3, Subtitle4 } from "../typography";
import { ColorPalette } from "../../styles";
import { useStore } from "../../stores";

export const FeeCoverageDescription = ({
  feeConfig,
}: {
  feeConfig: IFeeConfig;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        lineHeight: "155%",
      }}
    >
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

export const FeeCoverageBox = ({ feeConfig }: { feeConfig: IFeeConfig }) => {
  const { priceStore } = useStore();
  const price = (() => {
    if (!feeConfig.fees[0]) {
      return undefined;
    }
    return priceStore.calculatePrice(feeConfig.fees[0]);
  })();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          padding: "1rem",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.75rem",
          borderRadius: "0.375rem",
          background: ColorPalette["gray-600"],
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Subtitle3 color={ColorPalette["gray-200"]}>Tx Fee</Subtitle3>

          <Subtitle3
            style={{
              textDecoration: "line-through",
              textDecorationColor: ColorPalette["gray-300"],
            }}
          >
            <span style={{ color: ColorPalette["gray-50"] }}>
              {feeConfig.fees[0]?.toString()}{" "}
            </span>
            <span style={{ color: ColorPalette["gray-300"] }}>
              ({price?.toString()})
            </span>
          </Subtitle3>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Subtitle3 color={ColorPalette["gray-200"]}>
            Covered by Keplr
          </Subtitle3>
          <Subtitle3 color={ColorPalette["gray-50"]}>
            0 {feeConfig.fees[0]?.denom}
          </Subtitle3>
        </div>
      </div>
      <Subtitle3
        color={ColorPalette["gray-300"]}
        style={{ textAlign: "center" }}
      >
        Keep this window open during the transaction
      </Subtitle3>
    </div>
  );
};
