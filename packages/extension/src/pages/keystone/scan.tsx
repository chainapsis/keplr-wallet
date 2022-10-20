import React from "react";
import style from "./style.module.scss";
import { AnimatedQRScanner, Purpose } from "@keystonehq/animated-qr";
import { UR } from "@keplr-wallet/stores";

export interface Props {
  onChange(ur: UR): void;
}

export function Scan({ onChange }: Props) {
  return (
    <div className={style.page}>
      <div>Scan the QR code displayed on your Keystone Device</div>
      <AnimatedQRScanner
        purpose={Purpose.SYNC}
        handleScan={onChange}
        handleError={console.error}
        options={{
          width: 200,
        }}
      />
      <a
        href="#done"
        onClick={(e) => {
          e.preventDefault();
          onChange({
            type: "A",
            cbor: "0102030405060708090001020304050607080900",
          });
        }}
      >
        Done for debug
      </a>
      <p>
        Position the QR code in front of your camera. The screen is blurred but
        this will not affect the scan.
      </p>
    </div>
  );
}
