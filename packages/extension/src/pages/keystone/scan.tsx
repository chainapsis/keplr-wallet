import React, { useState } from "react";
import style from "./style.module.scss";
import { AnimatedQRScanner, Purpose } from "@keystonehq/animated-qr";
import { UR } from "@keplr-wallet/stores";
import { Loading } from "./loading";
import { Message } from "./message";

export interface Props {
  onChange(ur: UR): Promise<void>;
}

export function Scan({ onChange }: Props) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPermitted, setIsPermitted] = useState(true);
  const [isMsgShow, setIsMsgShow] = useState(false);

  const onVideoLoaded = (isLoaded: boolean) => {
    setIsPermitted(isLoaded);
  };

  const onError = () => {
    setIsMsgShow(true);
  };

  const handleScan = async (ur: UR) => {
    setIsConnecting(true);
    try {
      await onChange(ur);
    } catch (err) {
      console.error(err);
      onError();
    } finally {
      setIsConnecting(false);
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
          <img src={require("../../public/assets/svg/scanner.svg")} />
          <AnimatedQRScanner
            purpose={Purpose.COSMOS_SYNC}
            handleScan={handleScan}
            handleError={onError}
            videoLoaded={onVideoLoaded}
            options={{
              width: 248,
              height: 248,
            }}
          />
        </div>
        {isPermitted ? (
          <p className={style["help-text"]}>
            Position the QR code in front of your camera. The screen is blurred
            but this will not affect the scan.
          </p>
        ) : (
          <p className={style["error-text"]}>
            Please enable your camera permission via [Settings]
          </p>
        )}
      </div>
      {isConnecting && <Loading title="Connecting" />}
      {isMsgShow && (
        <Message onClose={() => setIsMsgShow(false)} type="error">
          Invalid QR code. Please ensure you have selected a valid QR code from
          your Keystone device.
          <a href="https://keyst.one/keplr" target="_blank" rel="noreferrer">
            Tutorial
          </a>
        </Message>
      )}
    </div>
  );
}
