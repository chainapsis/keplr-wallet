import React, { useCallback, useRef, useState } from "react";
import style from "./style.module.scss";
import { AnimatedQRScanner, Purpose, URType } from "@keystonehq/animated-qr";
import { UR } from "@keplr-wallet/stores";
import { Loading } from "./loading";
import { Message } from "./message";

export enum ScanType {
  Sync = "sync",
  SignEth = "signEth",
  SignCosmos = "signCosmos",
}

export interface Props {
  type: ScanType;
  onChange(ur: UR): Promise<void>;
  onBack?(): void;
}

export function Scan({ type, onChange, onBack }: Props) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPermitted, setIsPermitted] = useState(true);
  const [isMsgShow, setIsMsgShow] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const purposeMap = {
    sync: Purpose.COSMOS_SYNC,
    signEth: Purpose.SIGN,
    signCosmos: Purpose.COSMOS_SIGN,
  };

  let timer: NodeJS.Timeout | undefined;
  const onVideoLoaded = (isLoaded: boolean) => {
    setIsPermitted(isLoaded);
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

  const isErrored = useRef(false);
  const onError = useCallback(() => {
    setIsMsgShow(true);
    isErrored.current = true;
  }, []);

  const closeMsg = useCallback(() => {
    setIsMsgShow(false);
    isErrored.current = false;
  }, []);

  const handleScan = useCallback(
    async (ur: UR) => {
      if (isErrored.current) {
        return;
      }
      setIsConnecting(true);
      try {
        await onChange(ur);
      } catch (err) {
        console.error(err);
        onError();
      } finally {
        setIsConnecting(false);
      }
    },
    [onChange, onError]
  );

  const errorTimes = useRef<number[]>([]);
  const handleError = useCallback(() => {
    errorTimes.current.unshift(Date.now());
    const n = 4;
    if (
      errorTimes.current[n] &&
      errorTimes.current[0] - errorTimes.current[n] < 1000
    ) {
      onError();
    }
  }, [onError]);

  return (
    <div className={`${style["page"]}`}>
      {onBack && (
        <div className={style["back"]} onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z" />
          </svg>
        </div>
      )}
      <div>
        <div className={style["title"]}>Scan the QR Code</div>
        <img
          className={style["logo"]}
          src={require("../../public/assets/img/keystone/logo.svg")}
          alt="Keystone"
        />
        <div className={style["subtitle"]}>
          Scan the QR code displayed on your Keystone device
        </div>
        <div className={style["scanner"]}>
          {!isVideoLoaded && (
            <img src={require("../../public/assets/svg/scanner.svg")} />
          )}
          <AnimatedQRScanner
            purpose={purposeMap[type]}
            urTypes={type !== ScanType.Sync ? [URType.EVM_SIGNATURE] : []}
            handleScan={handleScan}
            handleError={handleError}
            videoLoaded={onVideoLoaded}
            options={{
              width: 248,
              height: 248,
              blur: false,
            }}
          />
        </div>
        {isPermitted ? (
          <p className={style["helpText"]}>
            Position the QR code in front of your camera.
          </p>
        ) : (
          <p className={style["errorText"]}>
            Please enable your camera permission via [Settings]
          </p>
        )}
      </div>

      {isConnecting && <Loading title="Connecting" />}
      {isMsgShow && (
        <Message onClose={closeMsg} type="error">
          Invalid QR code. Please ensure you have selected a valid QR code from
          your Keystone device.
          <a href="https://keyst.one/t/keplr" target="_blank" rel="noreferrer">
            Tutorial
          </a>
        </Message>
      )}
    </div>
  );
}
