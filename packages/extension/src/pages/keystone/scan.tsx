import React from "react";
import style from "./style.module.scss";
import { AnimatedQRScanner, Purpose } from "@keystonehq/animated-qr";

export interface UR {
  type: string;
  cbor: string;
}

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
      <p>
        Position the QR code in front of your camera. The screen is blurred but
        this will not affect the scan.
      </p>
    </div>
  );
}
