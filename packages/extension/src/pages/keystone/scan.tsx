import React, { useState } from "react";
import style from "./style.module.scss";
import { AnimatedQRScanner, Purpose } from "@keystonehq/animated-qr";
import { UR } from "@keplr-wallet/stores";
import { Loading } from "./loading";

export interface Props {
  onChange(ur: UR): void;
}

export function Scan({ onChange }: Props) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  let timer: NodeJS.Timeout | undefined;
  const onVideoLoaded = (isLoaded: boolean) => {
    // the first trigger is too early
    if (!timer) {
      timer = setTimeout(() => {
        setIsVideoLoaded(isLoaded);
      }, 2000);
    } else {
      clearTimeout(timer);
      setIsVideoLoaded(isLoaded);
    }
  };
  return (
    <div className={`${style.page} ${style.center}`}>
      <div>
        <div className={style.title}>Scan the QR Code</div>
        <div className={style.subtitle}>
          Scan the QR code displayed on your Keystone Device
        </div>
        <div className={style.scanner}>
          {/* {!isVideoLoaded && (
            <img src={require("../../public/assets/svg/scanner.svg")} />
          )} */}
          <img src={require("../../public/assets/svg/scanner.svg")} />
          <AnimatedQRScanner
            purpose={Purpose.COSMOS_SYNC}
            handleScan={onChange}
            handleError={console.error}
            videoLoaded={onVideoLoaded}
            options={{
              width: 248,
              height: 248,
            }}
          />
        </div>
        <p className={style["help-text"]}>
          Position the QR code in front of your camera. The screen is blurred
          but this will not affect the scan.
        </p>
        <a
          href="#done"
          style={{ position: "absolute" }}
          onClick={(e) => {
            e.preventDefault();
            onChange({
              type: "A",
              cbor:
                "02bda203ca44c955f1db94bb0d34ef072cebeb27f5bc7b13656bb2881301d017a6",
            });
          }}
        >
          Done for debug
        </a>
      </div>
      {isConnecting && <Loading title="Connecting" />}
    </div>
  );
}
