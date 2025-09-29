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
        padding: "0.25rem 0",
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

export const FeeCoverageOverlay = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        width: "100vw",
        height: "9.75rem",
        background:
          "linear-gradient(180deg, rgba(9, 9, 10, 0) 35%, #013E55 100%)",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "1.25rem",
          height: "1.25rem",
          zIndex: 2,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            opacity="0.45"
            d="M10 0C10.9828 5.06035 14.9396 9.01717 20 10C14.9396 10.9828 10.9828 14.9396 10 20C9.01717 14.9396 5.06035 10.9828 0 10C5.06035 9.01717 9.01717 5.06035 10 0Z"
            fill="#009FDD"
          />
        </svg>
      </div>
    </div>
  );
};
